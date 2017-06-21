/**
 * Created by steven on 17/5/12.
 */
const UserInfo = require('./userInfo');
const userInfo = new UserInfo();
const Utils = require('../../common/utils');
const Token = require('../../common/token');
const config = require('../../config');
let service = {};

service.login = function(req, res, username, password, cb){
  let cipherPassword = Utils.cipher(password, config.KEY);
  let query = {
    name: username,
    password: cipherPassword
  }

  if(Utils.checkEmail(username)){
    query._id = username;
  }

  userInfo.collection.findOne(query, { fields: { _id: 1 } }, function(err, doc) {
    if(err){
      return cb && cb(Utils.err(req.t('userInfoFindWrong.code'), req.t('userInfoFindWrong.message')));
    }

    if(doc){
      const expires = Date.now() + config.cookieExpires;
      var token = Token.create(doc._id, expires, config.KEY);
      res.cookie('ticket', token, {
        expires: new Date(expires),
        httpOnly: true
      });
      return cb && cb(null, token);
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