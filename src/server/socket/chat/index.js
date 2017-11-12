/**
 * Created by chaoningxie on 2017/11/12.
 */
const utils = require('../../common/utils');

const authorize = require('./authorize');
const result = require('../../common/result');

// userId map socketIds
let socketIds = {};

class ChatIO {
  constructor(io) {
    let me = this;
    let chatIO = io.of('/chat');
    /// authorize
    chatIO.use(function(socket, next) {
      utils.console('chat ready', socket.id);
      let rs = authorize(socket, next());
      if(rs) {
        socket.info = rs.info;
        if(!socketIds[rs.info.userId]) {
          socketIds[rs.info.userId] = {};
        }

        if(!socketIds[rs.info.userId][socket.id]) {
          socketIds[rs.info.userId][socket.id] = socket.id;
        }

        utils.console('new socket connect, show all sockets', socketIds);

        next();
      }
    });

    chatIO.on('connection', function (socket) {
      utils.console('connection.socket.id', socket.id);
      utils.console('connection.info', socket.info);

      socket.emit('chat', result.success('welcome'));

      socket.on('chat', function(msg) {
        utils.console('chat:' + new Date().getTime(), msg);
        me.dispatchMessage(msg, socket);
      });

      socket.on('joinRoom', function(roomId) {
        if(!socket.rooms[roomId]) {
          socket.join(roomId, function (err) {
            if(err) {
              socket.emit('joinRoomResult', result.fail(err.message));
              return;
            }

            socket.emit('joinRoomResult', result.success('ok'));
          });
        }
      });

      socket.on('error', function(err) {
        utils.console('socket error socket id: '+ socket.id, err);
        socket.disconnect();
      });

      socket.on('disconnect', function() {
        utils.console('disconnect with client :' + socket.id);

        for(let i = 0; i < socket.rooms.length; i++) {
          console.log(socket.info.userId + 'leave room ' + socket.rooms[i]);
          socket.leave(socket.rooms[i]);
        }

        socketIds[socket.info.userId] = {};
        delete socketIds[socket.info.userId][socket.id];
      });
    });
  }

  dispatchMessage(msg, socket) {
    console.log(socket.rooms, msg);
    if(!socket.rooms[msg.to]) {
      socket.join(msg.to, function(err) {
        console.log(err, socket.rooms);
        socket.to(msg.to).emit('chat', msg.from + ':' + msg.content);
      });
    }else {
      socket.to(msg.to).emit('chat', msg.from + ':' + msg.content);
    }
  }
};

module.exports = ChatIO;

