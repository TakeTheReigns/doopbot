const p = require('child_process')
//const {} = require('bot1.js');
var bot 

newBot()

function newBot(){
    setTimeout(function() {
        bot = p.fork('bot1.js')
        bot.on('message', botMessages)
      }, 100);
}

function oldBot(){
    bot.removeListener('message', botMessages)
}




function botMessages(msg){
    switch (msg){
        case 'socketClosed':
            bot.kill()
            oldBot()
            newBot()
        break;
        case 'Error [ERR_IPC_CHANNEL_CLOSED]: Channel closed':
            bot.kill()
            oldBot()
            newBot()
        break;
        default:
            console.log('default from botMessages:')
            console.log(msg)
        break;

    }
}

function err(E){
    console.log(E)
    console.log(E.code)
    if(E.code == 'ERR_IPC_CHANNEL_CLOSED'){
        oldBot()
        newBot()
    } else {
        console.log(`botWatch got a code: ${E.code} << and we don't have any handling for it.`)
    }
}

//module.exports = {disconnected}
/*
Error[ERR_IPC_CHANNEL_CLOSED]: Channel closed
    at new NodeError(node: internal / errors: 371: 5)
    at EventEmitter.target.send(node: internal / child_process: 741: 16)
    at EventEmitter.emit(node: events: 532: 35)
    at Client.< anonymous > (C: \Users\Neptune\node_modules\mineflayer\lib\loader.js: 103: 9)
    at Client.emit(node: events: 532: 35)
    at Socket.endSocket(C: \Users\Neptune\node_modules\minecraft - protocol\src\client.js: 145: 12)
    at Socket.emit(node: events: 532: 35)
    at endReadableNT(node: internal / streams / readable: 1346: 12)
    at processTicksAndRejections(node: internal / process / task_queues: 83: 21) {
    code: 'ERR_IPC_CHANNEL_CLOSED'
}*/