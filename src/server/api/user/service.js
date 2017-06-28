/**
 * Created by steven on 17/5/12.
 */
const i18n = require('i18next');
const utils = require('../../common/utils');
const result = require('../../common/result');
const Token = require('../../common/token');
const config = require('../../config');

const UserInfo = require('./userInfo');
const userInfo = new UserInfo();

let service = {};

service.login = function(req, res, username, password, cb){
  let cipherPassword = utils.cipher(password, config.KEY);
  let query = {
    name: username,
    password: cipherPassword
  };

  if(utils.checkEmail(username)) {
    query._id = username;
  }

  userInfo.collection.findOne(query, { fields: { _id: 1 } }, function(err, doc) {
    if(err) {
      return cb && cb(i18n.t('databaseError'));
    }

    if(!doc) {
      return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
    }

    const expires = Date.now() + config.cookieExpires;
    const token = Token.create(doc._id, expires, config.KEY);

    res.cookie('ticket', token, {
      expires: new Date(expires),
      httpOnly: true
    });

    return cb && cb(null, token);
  });

};

service.setCookie = function(res, id) {
  const expires = Date.now() + config.cookieExpires;
  const token = Token.create(id, expires, config.KEY);
  res.cookie('ticket', token, {
    expires: new Date(expires),
    httpOnly: true
  });
  return token;
};

module.exports = service;
