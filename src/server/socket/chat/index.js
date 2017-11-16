/**
 * Created by chaoningxie on 2017/11/12.
 */
const utils = require('../../common/utils');

const authorize = require('./authorize');
const result = require('../../common/result');

const accountService = require('../../api/im/accountService');
const sessionService = require('../../api/im/sessionService');

// userId map socketIds
const socketIds = {};

class ChatIO {
  constructor(io) {
    const me = this;
    const chatIO = io.of('/chat');

    // / authorize
    chatIO.use((socket, next) => {
      const rs = authorize(socket, next());

      if (rs.status === '0') {
        const data = rs.data;
        socket.info = data.info;

        me.login(socket, data.info.userId, () => {
          next();
        });
      } else {
        socket.emit('error', rs);
        socket.disconnect();
      }
    });

    chatIO.on('connection', (socket) => {
      utils.console('connection.socket.id', socket.id);
      utils.console('connection.info', socket.info);

      socket.on('message', (msg) => {
        utils.console(`message:${new Date().getTime()}`, msg);
        me.dispatchMessage(msg, socket);
      });

      socket.on('error', (err) => {
        utils.console(`socket error socket id: ${socket.id}`, err);
        socket.disconnect();
      });

      socket.on('disconnect', () => {
        utils.console(`disconnect with client :${socket.id}`);

        for (let i = 0; i < socket.rooms.length; i++) {
          console.log(`${socket.info.userId}leave room ${socket.rooms[i]}`);
          socket.leave(socket.rooms[i]);
        }

        socketIds[socket.info.userId] = {};
        delete socketIds[socket.info.userId][socket.id];
      });
    });
  }

  dispatchMessage(msg, socket) {
    console.log(socket.rooms, msg);
    if (!socket.rooms[msg.to]) {
      socket.join(msg.to, (err) => {
        console.log(err, socket.rooms);
        socket.to(msg.to).emit('chat', `${msg.from}:${msg.content}`);
      });
    } else {
      socket.to(msg.to).emit('chat', `${msg.from}:${msg.content}`);
    }
  }

  login(socket, userId, successFn) {
    if (!socket.rooms[userId]) {
      accountService.login(userId, (err, doc) => {
        if (err) {
          socket.emit('login', result.fail(err));
          socket.disconnect();
          return false;
        }

        socket.join(doc._id, (err) => {
          if (err) {
            socket.emit('login', result.fail(err.message));
            socket.disconnect();
            return false;
          }

          socket.accountInfo = doc;
          socket.emit('login', result.success(socket.accountInfo));

          return successFn && successFn();
        });
      });
    } else {
      socket.emit('login', result.success(socket.accountInfo));
      return successFn && successFn();
    }
  }

  getRecentContactList(socket, callback, page, pageSize, fieldNeeds, cb) {
    sessionService.list(socket.accountInfo._id, page, pageSize, fieldNeeds, '-modifyTime', (err, docs) => {
      if (err) {
        return socket.emit('getRecentContactList', result.fail(err));
      }

      return socket.emit('getRecentContactList', result.success(docs));
    });
  }

}

module.exports = ChatIO;

