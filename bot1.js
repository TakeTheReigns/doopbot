//import process from 'node:process';

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow
const {writeToFile, readChat, fileToArray, getToday, getTime, characterCheck} = require('./readWrite')
const autoeat = require("mineflayer-auto-eat")
const armorManager = require('mineflayer-armor-manager')
const mcData = require('minecraft-data')("1.18.2")
//const {disconnected} = require('./botwatcher')


const bot = mineflayer.createBot(
    {
    host: 'mc.chimpout.club',
    port: 25600,
    username: 'DooProcess',
    //password: 'password'
    }
);


bot.loadPlugin(pathfinder)
bot.loadPlugin(autoeat)
bot.loadPlugin(armorManager);

    
{ //variables

var startUpTime = getTime()

var chatTicks = 0
var master = "withDueProcess"
var meAm = "DooProcess"
var sayDelay = ["!"]
var chatterArray = []
var playersOnline = []

var reportToConsole = false
var followOrders = false
var followPlayer = master
var publicCommands = true

var lookCounter = 2
var maxLookInterval = 5
var minLookInterval = 1
var lookingAtThis
var lookDisable = false
var lookedAtPlayer 

var healthToEat = 15
var hungerToEat = 15
var starvingLevel = 10

var farmCountDefault = 1
var farmCounter = farmCountDefault
var farmTarget = []
var farmDisable = true
var bannedEntites = 'item player llama_spit ender_pearl experience_orb arrow eye_of_ender fireworks_rocket tnt falling_block lightning_bolt leash_knot evoker_fang fishing_bobber egg snowball trident end_crystal'

var playerCount = 0
var playerDailyHigh
var playerDailyLow

var tooManyCharacters = 30
var tooManyEmoji = 10

var fakeLocation = `minecraft:the_nether ${coin('-')}4${parseInt(Math.random()*1000)} 129 ${coin('-')}4${parseInt(Math.random()*1000)}`
}
bot.once('spawn', () => {
    bot.chat('/login formerlyjannies')
    bot.addChatPattern('vchat',/^\<(\S+)\> [d|D][o|O][o|O][p|P] (\S+) (.+)$/,{parse:true});
    bot.addChatPattern('vcmd',/^\<(\S+)\> [d|D][o|O][o|O][p|P] (\S+)$/,{parse:true});
    bot.addChatPattern('wchat',/^(\S+) whispers to you: (\S+) (.+)$/,{parse:true});
    bot.addChatPattern('wcmd',/^(\S+) whispers to you: (\S+)$/,{parse:true});
    bot.addChatPattern('join', /^\>(\S+) joined the game for the first time$/,{parse:true})
    onSpawn()
    process.send('bot lives matter')
})

bot.on('chat:vchat', chatProcessor)
bot.on('chat:vcmd', chatProcessor)
bot.on('chat:wchat', chatProcessor)
bot.on('chat:wcmd', chatProcessor)
//bot.on('physicsTick', physTickTimer)
bot.on('time', onTickLoop)

bot.on('health', onHealth)
bot.on('death', onDeath)
bot.on('playerCollect', onPickUp)
bot.on('playerUpdated', onPlayerCount)
//bot.on('playerLeft', onPlayerLeave)

function onSpawn(){
    //Set a look Target
    lookingAtThis = bot.nearestEntity()

    bot.autoEat.options = {
        bannedFood: ["golden_apple", "enchanted_golden_apple", "rotten_flesh"],
        checkOnItemPickup: true,
    }

    //bot.chat('!')
    
}

function onHealth(){
    
    if(bot.health <= healthToEat && bot.food <= hungerToEat){
        bot.autoEat.enable()
        bot.autoEat.eat()
        if(bot.food <= starvingLevel && bot.health < starvingLevel){
            bot.chat(`Help!  I am starving! Feed me @ ${bot.entity.position.x} ${bot.entity.position.y} ${bot.entity.position.z}`)

        }

    } else {
        bot.autoEat.disable()
    }
    if(reportToConsole){
        console.log(`Health ${bot.health} & Hunger ${bot.food}`)
    }
}

function onPickUp(ent, item){
    if(ent == bot.entity){
        bot.armorManager.equipAll()
    }
}

async function drawSword(){
    var sword = bot.inventory.items().find(item => item.name.includes('netherite_sword'))
    if (sword){
        await bot.equip(sword, 'hand')
    }
}

function onDeath(){
    followOrders = false
    farmDisable = true
    lookDisable = false

    bot.pathfinder.stop()
    //bot.deactivateItem()
}

function whispers(whisps){
    var vser = whisps[0][0]
    var cmd = whisps[0][1]
    var say = whisps[0][2]
    var yes = true
    console.log(whisps)
    if(vser != meAm){
        if(vser != master){
            if(cmd == 'say'){
                chatoption(cmd, vser, say)
            } else {
                bot.chat(vser+' is whispering naughty things to me!')
                bot.whisper(vser, 'make your first word say, and I will repeat you')
            }
        } else {
            chatoption(cmd, vser, say, yes)
        }
    }    
}

function chatProcessor(DoopArray){
    var vser = DoopArray[0][0]
    var cmd = DoopArray[0][1]
    var say = DoopArray[0][2]
    if(vser != meAm){
       /* if(vser != master){
          bot.chat(`${vser} not my ${msg}`)
       } else {
           bot.chat(msg)
       }*/
       chatoption(cmd, vser, say)
    }

}

/* function onPlayerLeave(vser){
    capslock = vser.username
    sayDelay.push(`FREE ${capslock.toUpperCase()}`)
} */
/*function physTickTimer(){
    if(physTicks == 0){
        //bot.physicsEnabled = false
        if(sayDelay != '!'){
            //bot.chat(sayDelay)
            //sayDelay = '!'
        }
    } else if (physTicks < 0){
        physTicks = 0    
    } else {
        physTicks--
    }
}
*/

function onTickLoop(){
    //bot.chat(`I'm Spamming!!!`)
    if(!lookDisable){
        if(lookCounter <=0){
            lookAtSomething()
            lookCounter = Math.random()*(maxLookInterval-minLookInterval)+minLookInterval
        } else {
            lookCounter--
        }
    }

    if(!farmDisable){
        if(reportToConsole){
            //console.log(farmCounter)
        }
        if(bot.physicsEnabled){
            bot.physicsEnabled = false
        }
        if(farmCounter <= 0){
            //lookAtSomething()
            drawSword()
            for(let t in farmTarget){
                try{
                    if(bot.nearestEntity().name == farmTarget[t]){
                        if(bot.entity.position.y > bot.nearestEntity().position.y - 3){
                            bot.attack(bot.nearestEntity())
                            break;
                        }
                    } else if(reportToConsole){
                        console.log(`${farmTarget[t]} is not ${bot.nearestEntity().name}`)
                    }
                } catch (err) {

                }
            }
            farmCounter = farmCountDefault
        } else {
            farmCounter--
        }
    } else {
        if(!bot.physicsEnabled){
            bot.physicsEnabled = true
        }
    }
    if(sayDelay.length >0){
        if(reportToConsole){
            console.log(`I have queued ${sayDelay.length} and in ${chatTicks} I will say one`)
        }
    }
    if(sayDelay.length > 0 && chatTicks <= 0){
        //bot.chat(`${sayDelay.lenght} is my list`)
        bot.chat(sayDelay[0])
        sayDelay.shift()
        if(sayDelay.length > 0){
            chatTicks = parseInt(sayDelay[0].length/20+1)
        }
    } else if(chatTicks > 0){
        chatTicks--
    } else {
        chatTicks = 0
    }

}

//Basic Markov Chain Generator
//takes a length of ouput sentence and a string (or list) to read from
//returns a string
function markovChainGenText(length, dataset)
{
    function choose(list) {
        return list[Math.floor(Math.random()*list.length)]
    }

    var output =      [];
    var choice_pool = [];
    current_len =      0;

    var dataset =      dataset.toString().toLowerCase();
    var dataset = dataset.split(" ")
    var current_word = choose(dataset);
    output.push(current_word);

    while (current_len < length)
    {
        //Start adding words
        for (var word = 0; word < dataset.length; word++)
        {
            //add to the choice pool
            if (dataset[word] == current_word)
            {
                try
                {
                    choice_pool.push(dataset[word+1]);
                }
                catch
                {
                    choice_pool.push(choose(dataset));
                }
            }

        }
        output.push(choose(choice_pool)); //choose a word

        var choice_pool =  [];
        var current_word = output.slice(-1);
        current_len += 1;
    }

    return output.join(" ")
};

function chatoption(sel, vser, xtra, masterOverride){
    console.log(`${vser} issued command ${sel} with ${xtra}`)
    if(/§+/.test(xtra+vser+sel)){
        sayDelay.push(`Wait, that's illegal!`)
        return
    }
    if(sel == "say" || sel == "greentext"){


        if(xtra.length > tooManyCharacters){

            if(characterCheck(xtra, ':') > tooManyEmoji){

                xtra = undefined

            }

        }

    }

    switch (sel) {
        case 'report':
            if(masterOverride || publicCommands){
                switch (xtra){
                    case '1':
                        findSpawners()
                    break;
                    case 'lookTarget':
                        console.log(lookingAtThis)
                    break;
                    default:
                        reportToConsole = !reportToConsole
                        console.log(`Reporting to console is ${reportToConsole}`)
                    break;
                }
                
            } else {
                deny(vser)
            }
            break;
        case 'farm':
            if(xtra == 'help'){
                sayDelay.push(`I will attack any mobs near me you list, for example "doop farm zombie skeleton cow" or tell me to farm and I will stop.`)
            } else if(masterOverride || publicCommands){
                
                if(farmDisable){
                    if(xtra){
                        farmTarget = xtra.split(/\s/)
                        for (var i = 0;i < farmTarget.length; i++) {
                            if(bannedEntites.includes(farmTarget[i])){
                                sayDelay.push('I found a banned entity')
                                farmTarget.splice(i,1)
                                i--
                            }
                        }
                    }
                    if(farmTarget.length == 0){
                        farmDisable = true
                        lookDisable = false
                        sayDelay.push('I tried to farm nothing')
                        break;
                    } else {
                        console.log(farmTarget)
                        sayDelay.push(`I am farming ${farmTarget}`)
                        lookDisable = true
                        farmDisable = false
                    }
                } else {
                    farmTarget = []
                    sayDelay.push('Farming done')
                    lookDisable = false
                    farmDisable = true
                }
            } else {
                deny(vser)
            }
            break;
        case 'follow':
            if(masterOverride){
                followOrders = !followOrders
                followPlayer = bot.players[vser]
                followUser()
            } else {
                deny(vser)
            }
            break;
        case 'listInv':
            if(masterOverride){
                console.log(bot.inventory)
            } else {
                deny(vser)
            }
            break;
        case 'give':
            if(masterOverride || publicCommands){
                if(xtra == 'all'){
                    //dropAll()
                    sayDelay.push(`I'd love too, but I just crash instead.`)
                } else {
                    dropItems(xtra, vser)
                }
            } else {
                deny(vser)
            }
            break;
        case 'inventory':
            inventoryToString()
            break;
        case 'location':
            if(!masterOverride){
                if(vser == 'misatofan00' || vser == 'X_TAL' || vser == 'Bryce_MC' || coin('bool') || !publicCommands){
                    sayDelay.push(fakeLocation)
                } else {
                    sayDelay.push(`${bot.game.dimension} ${parseInt(bot.entity.position.x)} ${parseInt(bot.entity.position.y)} ${parseInt(bot.entity.position.z)}`)
                }
            } else {
                bot.whisper(vser, `${bot.game.dimension} ${parseInt(bot.entity.position.x)} ${parseInt(bot.entity.position.y)} ${parseInt(bot.entity.position.z)}`)
            }
            break;
        case 'ride':
            if(masterOverride || publicCommands){
                bot.chat('/ride')
            }
            break;
        case 'flip':
            coin('flip');
            break;
        case 'sword':
            drawSword();
            break;
        case 'sneed':
            sayDelay.push('Chuck')
            break;
        case 'chuck':
            sayDelay.push('Sneed')
            break;
        case 'feature':
            writeToFile('features.txt', `${getToday()} - ${vser}: ${xtra}`)
            sayDelay.push(`Ok, I'll remember that ${vser}`)
            break;
        case 'say':
            if(/^(\s.+)$/.test(xtra)){
                sayDelay.push(':sob:')
            } else if(/^(\/.+)$/.test(xtra)){
                if(masterOverride){
                    bot.chat(xtra)
                    console.log(`I tried to ${xtra}`)
                } else {
                    deny(vser)
                }
            } else if(xtra == undefined){
                sayDelay.push('...')
            } else {
                if(masterOverride){
                    bot.chat(xtra)
                } else {
                    sayDelay.push(xtra)
                    writeToFile('chatter.txt', xtra)
                    fileToArray.push(xtra)
                } 

            }
            //bot.chat('reeeeeeeeeeeeee')
            break;
        case 'tell':
            if(/\d+/.test(xtra)){
                sayDelay.push(chatter(vser, xtra))
            } else {
                sayDelay.push(chatter(vser))
            }
            break;
        case 'yell':
            if(/\d+/.test(xtra)){
                sayDelay.push(chatter(vser, xtra).toUpperCase())
            } else {
                sayDelay.push(chatter(vser).toUpperCase())
            }
            break;
        case 'greentext':
            if(xtra){
                if(/\d+/.test(xtra)){
                    sayDelay.push('>'+chatter(vser, xtra))
                } else {
                    greentextify = ">"+xtra
                    sayDelay.push(greentextify)
                    writeToFile('chatter.txt', greentextify)
                    fileToArray.push(greentextify)
                }
            } else {
                greentextify = chatter(vser)
                if(greentextify[0] == '>'){
                    sayDelay.push(greentextify)
                } else {
                    sayDelay.push(">"+greentextify)
                }
            }
            break;
        case 'trolls':
            var tr = 'trolls'
            if(xtra){
                for (let index = 0; index < xtra.length; index++) {
                    tr+=' trolling trolls'
                }
            }
            sayDelay.push(tr)
            break;
        case 'roll':
                die(xtra)
            break;
        case 'skin':
                bot.chat(`/${sel} ${xtra}`)
            break;
        case 'players':
            sayDelay.push(`Today's player counts: The most I saw was ${playerDailyHigh} and the least was ${playerDailyLow} since ${startUpTime} USEAST`)
            break;
        default:
            if(/^([i|I][s|S] .+)$/.test(xtra)){
                sayDelay.push("i've identified an is, you said is!")
                sayDelay.push(`someday, ${master} will write the code for this...`)
                xtra = xtra.slice(3)

            } else {
                sayDelay.push(chatter(vser))
            }
            break;
    }
}

function chatter(vser, i){
    var chat
    try{
        chat = readChat(vser, parseInt(i))
    } catch (err) {
        chat = `Contact withDueProcess immediately!  I forgot how to read!`
    }
    return chat
}

function coin(str){
    val = Math.random()
    switch (str) {
        case 'flip':
            if(val > .5){
                land = 'Heads!'
            } else {
                land = 'Tails'
            }
            sayDelay.push(land)
            break;
        case '-':
            if(val > .4){
                return '-'
            } else {
                return ''
            }
            break;
        case 'bool':
            if(val > .6){
                return true
            } else {
                return false
            }
        break;
            
        case 'talk':
            bot.chat(markovChainGenText(10, chatter(vser)))
        break;
            
        default:
            sayDelay.push('shekels')
            break;
    }
    
}

function die(num){
    sides = 6
    if(/^([0-9]+)$/.test(num) == true){
        sides = parseInt(num)
    }
    sides*=Math.random()
    sides++
    sayDelay.push(parseInt(sides))
}

function deny(vser){
    bot.chat('no')
}

async function dropItems(item, vser){
    hasItem = false
    isVser = false
    itemList = bot.inventory.items();
    nearPlayers = entitiesOfType('player')


    if(nearPlayers.length > 1){
        for(let ply in nearPlayers){
            if(nearPlayers[ply].username == vser){
                isVser = true
                Vser = nearPlayers[ply]
                break;
            }
        }
    }

    if(isVser){
        await bot.lookAt(Vser.position, true)
    } else {
        sayDelay.push(`I don't see you ${vser}`)
        return
    }

    for(key in itemList){
        if(itemList[key].name == item){
            bot.tossStack(itemList[key])
            sayDelay.push(`Here's some ${itemList[key].name}`)
            hasItem = true
            break;
        }
    }

    if(!hasItem){
        sayDelay.push(`I don't have that, ${vser}`)
    }
}

function dropAll(){
    itemList = bot.inventory.items();
    for(key in itemList){
        if(itemList[key].name != 'diamond_sword'){
            bot.tossStack(itemList[key]) 
        }
    }
}

function tossNext() {
    if (bot.inventory.items().length != 0){
        const item = bot.inventory.items()[0]
        bot.tossStack(item)
        tossNext()
    }
}

function inventoryToString(){
    itemString = 'I have'
    itemList = bot.inventory.items();
    for(key in itemList){
        if(itemString.length > 100){
            sayDelay.push(itemString)
            itemString = 'and'
        }
        if(!itemString.includes(itemList[key].name)){
            itemString+=', '+itemList[key].name
        }
    }
    sayDelay.push(itemString)
}

function entitiesOfType(ofType){
    be = bot.entities
    typeList = []
    for(let key in be){
        if(be[key].type == ofType){
            typeList.push(be[key])
        }
    }

    return typeList
}

function followUser(){
    if(!followPlayer || !followPlayer.entity){
        bot.chat(`I can't see ${followPlayer}`)
        return
    }
    if(!followOrders){
        bot.pathfinder.stop()
        return
    }
    //const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)
    movements.scafoldingBlocks = []
    movements.canDig = false
    movements.maxDropDown = 17

    const goal = new GoalFollow(followPlayer.entity, 3)
    bot.pathfinder.setGoal(goal, true)
}
/*function SPAMCHAT(){
    chatterArray = readFile()
    for (var i = 0; i < chatterArray.length; i++){
        bot.chat(chatterArray[i])
    }
}*/

function lookAtSomething(){
    var mobsCount = 0
    var playerCount = 0
    var entityList = bot.entities
    var keys = 0
    var nearPlayers = []

    for (let key in entityList) {
        if(entityList[key].type == 'mob'){
            mobsCount++
            //console.log (entityList[key].mobType)
            if(entityList[key].mobType == 'Skeleton' || entityList[key].mobType == 'Creeper'){
                if(reportToConsole){
                    //console.log(`${entityList[key].mobType} @ ${entityList[key].position}`)
                }
            }
        } else if (entityList[key].type == 'player'){
            playerCount++
            if(entityList[key].username != meAm){
                nearPlayers.push(entityList[key])
            }
        } else if (entityList[key].name == 'chest_minecart'){
            if(reportToConsole){
                console.log(`chest minecart @ ${entityList[key].position}`)
            }
        }
        keys++
        //console.log(entityList[key]);
    }

    playersNearMe = nearPlayers

    if(reportToConsole){
        findSpawners();
    }

    if(bot.nearestEntity() != lookingAtThis){
        lookingAtThis = bot.nearestEntity()
        
        try{
            if(lookingAtThis.type == 'player' && !reportToConsole){
                if(lookingAtThis.username != lookedAtPlayer){
                    sayDelay.push(`Hello ${lookingAtThis.username}`)
                    lookedAtPlayer = lookingAtThis.username
                }
            }
        } catch (e1){
            console.log(`I can't understand ${e1} and ${lookingAtThis}`)
        }
        //console.log(lookingAtThis)
        if(reportToConsole){
            console.log(`${lookingAtThis.name} is my new entity to look at of ${keys} choices`)
            console.log(`Of those, ${mobsCount} are mobs, and ${playerCount} are players`)
        }
    }
    try{
        bot.lookAt(lookingAtThis.position)
    } catch (err){

    }
    //console.log(`${lookingAtThis.name} is my new entity to look at of ${keys} choices`)
    //console.log(`Of those, ${mobsCount} are mobs, and ${playerCount} are players`)
    /* for (var i = 0; i < entityList.length; i++){
        console.log(`what is ${entityList[i]}`)
        if(entityList[i].type == 'mob'){
            mobsCount++
        } else if (entityList[i].type == 'player'){
            playerCount++
        }
    } */

}

async function findSpawners() {
    // Find a nearby grass block
  
    const blocks = bot.findBlocks({
      matching: mcData.blocksByName.spawner.id,
      maxDistance: 128,
      count: 32
    })
  
    if (blocks.length === 0) {
      //bot.chat("I don't see that block nearby.")
      return
    }
  
    const targets = []
    for (let i = 0; i < Math.min(blocks.length, 32); i++) {
      targets.push(bot.blockAt(blocks[i]))
      console.log(blocks[i])
    }
  
    //console.log('TARGET BLOCKS:', targets.length)
  
    /* try {
      await bot.collectBlock.collect(targets)
    } catch (err) {
      console.log('THERE WAS AN ERROR:', err)
      console.log(err) // Handle errors, if any
    } */
  
  }

function onPlayerCount(){
    var playerList = bot.players
    var playerNames = []
    for(let key in playerList){
        playerNames.push(playerList[key].username)
    }
    //LOGGING PLAYERS ON THE SERVER
    if(playerCount == 0){
        playerCount = playerNames.length
        playerDailyHigh = playerCount
        playerDailyLow = playerCount
        writeToFile(`logs/${getToday()}_players.txt`,`BOT ONLINE\n${getTime()} - ${playerCount} Players, ${playerNames}`)
    } else if(playerCount != playerNames.length){
        if(playerNames.length > playerDailyHigh){
            playerDailyHigh = playerNames.length
        }
        if(playerNames.length < playerDailyLow){
            playerDailyLow = playerNames.length
        }
        playerCount = playerNames.length
        writeToFile(`logs/${getToday()}_players.txt`,`${getTime()} - ${playerCount} Players, ${playerNames}`)
    }
    //SHITPOSTY FREE THEM FUNCITON
    if(playersOnline.length > playerNames.length){
        for(var i in playerNames){
            for(var j in playersOnline){
                if(playerNames[i]==playersOnline[j]){
                    //console.log(`MATCH ${playerNames[i]} = ${playersOnline[j]}, removing ${j} from ${playersOnline.length}`)
                    playersOnline.splice(j, 1)
                    break;
                }
            }
        }
        if(Math.random() > .9){
            sayDelay.push(`FREE ${playersOnline[0].toUpperCase()}`)
        }
    }
    playersOnline = playerNames
}
//bot.on('end', process.send)
//bot.on('kicked', process.send)
//bot.on('error', process.send)
