/**
 * Created by steven on 17/5/12.
 */
const UserInfo = require('./userInfo');
const userInfo = new UserInfo();
const Utils = require('../../common/utils');
const Token = require('../../common/token');
const config = require('../../config');
let service = {};

service.login = function(req, username, password, cb){
  let cipherPassword = Utils.cipher(password, config.KEY);
  userInfo.collection.findOne({
    name: username, password: cipherPassword
  }, { fields: { _id: 1 } }, function(err, doc) {
    if(err){
      return cb && cb(Utils.err(req.t('userInfoFindWrong.code'), req.t('userInfoFindWrong.message')));
    }

    if(doc){
      return cb && cb(null, doc._id);
    }else{
      return cb && cb(Utils.err(req.t('usernameOrPasswordIsWrong.code'), req.t('usernameOrPasswordIsWrong.message')))
    }
  })
}

service.setCookie = function(res, id){
  const expires = Date.now() + config.cookieExpires;
  var token = Token.create(id, expires, config.KEY);
  res.cookie('ticket', token, {
    expires: new Date(expires),
    httpOnly: true
  });
  return token;
}

module.exports = service;