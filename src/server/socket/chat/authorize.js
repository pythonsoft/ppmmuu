/**
 * Created by chaoningxie on 2017/2/7.
 */
const utils = require('../../common/utils');
const config = require('../../config');
const KEY = config.KEY;

let getClientIp = function(req) {
  let ipStr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  return ipStr.replace(/[:f]+/g, '');
};

let getClientPort = function(req) {
  return req.socket.remotePort;
};

let authorize = function(socket, next) {
  let authorize = socket.request.headers['x-custom-header-for-authorize'] || utils.formatCookies(socket.request.headers.cookie)['ticket'];
  let secret = socket.request.headers['x-custom-header-secret'] || 1;

  let clientIp = getClientIp(socket.request);
  let clientPort = getClientPort(socket.request);

  utils.console('remote client', clientIp + ':' + clientPort);
  utils.console('secret', secret === 1 ? '加密传输' : '普通传输');

  if(authorize) {
    try{
      let dec = utils.decipher(authorize, KEY);
      let codes = dec.split('-');
      let userId = codes[0];
      let secret = !!codes[1];

      if(userId) {
        utils.console('authorize', userId);
        return { socketId: socket.id, info: { userId: userId, secret: secret } }
      }else {
        utils.console('authorize', 'authorize invalid.');
        socket.disconnect();
        return false;
      }
    }catch (e) {
      utils.console('authorize', 'authorize invalid.');
      socket.disconnect();
      return false;
    }
  }else {
    utils.console('authorize', 'authorize is not exist in header');
    socket.disconnect();
    return false;
  };
};

module.exports = authorize;
