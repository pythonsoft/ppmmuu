'use strict';

const helper = {};
const accountService = require('../../api/im/accountService');
const result = require('../../common/result');
const loginMiddleware = require('../../middleware/login');

helper.ensureInRoom = function joinRoom(socket, userId, successFn) {
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
};

helper.ensureLogin = function (socket, next) {
  const rs = loginMiddleware.webSocketMiddleware(socket);

  if (rs.status === '0') {
    const data = rs.data;
    socket.info = data.info;

    helper.ensureInRoom(socket, data.info.userId, () => {
      next();
    });
  } else {
    socket.emit('error', rs);
    socket.disconnect();
  }
}

module.exports = helper;
