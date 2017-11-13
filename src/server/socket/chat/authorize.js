/**
 * Created by chaoningxie on 2017/2/7.
 */
const utils = require('../../common/utils');
const result = require('../../common/result');
const config = require('../../config');
const i18n = require('i18next');
const KEY = config.KEY;

let authorize = function(socket) {
  let authorize = socket.request.headers['x-custom-header-for-authorize'] || utils.formatCookies(socket.request.headers.cookie)['ticket'];
  let secret = socket.request.headers['x-custom-header-secret'] || '0';

  if(authorize) {
    try{
      let dec = utils.decipher(authorize, KEY);
      let codes = dec.split(',');
      let userId = codes[0];
      let expireDate = codes[1];

      const now = new Date().getTime();

      if(expireDate < now) { //过期
        return result.fail(i18n.t('imLoginDateExpire'));
      }

      secret = secret === '1' ? '1' : '0';

      utils.console('secret', secret === '1' ? '加密传输' : '普通传输');

      if(userId) {
        return result.success({ socketId: socket.id, info: { userId, secret } });
      }else {
        return result.fail(i18n.t('imAuthorizeInvalid'));
      }
    }catch (e) {
      return result.fail(i18n.t('imAuthorizeInvalid'));
    }
  }else {
    return result.fail(i18n.t('imAuthorizeInHeadInvalid'));
  };
};

module.exports = authorize;
