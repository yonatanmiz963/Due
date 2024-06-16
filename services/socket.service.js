

const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const boardService = require('../api/board/board.service')

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('connected');
        // console.log('socket.handshake', socket.handshake)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        // TODO: emitToUser feature - need to tested for CaJan21
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)  
            socket.myTopic = topic
            // logger.debug('Session ID is', socket.handshake.sessionID)
        })
        socket.on('send board', board => {
            console.log('board:', board)
            // emits to all sockets:
            // gIo.emit('add board', board)
            // emits only to sockets in the same room
            // socket.to(socket.myTopic).emit('add board', board)
            // socket.broadcast.to(socket.myTopic).emit('get board', board)
            console.log('current socket topic: ', socket.myTopic);      
            // socket.to(socket.myTopic).emit('get board', board)
            // gIo.to(socket.myTopic).emit('get board', board)
            gIo.to(socket.myTopic).emit('get board', board)
        })
        socket.on('chat newMsg', msg => {
            console.log('msg:', msg)

            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            socket.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('chat newMsg', msg => {
            console.log('msg:', msg)

            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            socket.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('chat user-typing', data => {
            // console.log('msg:', msg)

            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            socket.to(socket.myTopic).emit('chat user-typing', data)
        })
    })
}

function emit({ type, data }) {
    gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap)
    excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emit,
    broadcast
}



