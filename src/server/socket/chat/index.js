/**
 * Created by chaoningxie on 2017/11/12.
 */
const utils = require('../../common/utils');

const result = require('../../common/result');
const helper = require('./helper');
const sessionService = require('../../api/im/sessionService');

class ChatIO {
  constructor(io) {
    const me = this;
    const chatIO = io.of('/chat');

    chatIO.use(helper.ensureLogin);

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

  getRecentContactList(socket, page, pageSize, fieldNeeds) {
    sessionService.list(socket.accountInfo._id, page, pageSize, fieldNeeds, '-modifyTime', (err, docs) => {
      if (err) {
        return socket.emit('getRecentContactList', result.fail(err));
      }

      return socket.emit('getRecentContactList', result.success(docs));
    });
  }

}

module.exports = ChatIO;

