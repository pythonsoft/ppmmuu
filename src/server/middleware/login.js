/**
 * Created by chaoningxie on 26/2/17.
 */
const i18n = require('i18next');
const utils = require('../common/utils');
const result = require('../common/result');
const token = require('../common/token');
const config =  require('../config');
const UserInfo = require('../api/user/userInfo');
const RoleInfo = require("../api/role/roleInfo");
const userService = require("../api/user/service");
const userInfo = new UserInfo();
const roleInfo = new RoleInfo();
const redisClient = config.redisClient;

let Login = {};

Login.isLogin = function(req) {
  const query = utils.trim(req.query);
  const ticket = query['ticket'] || (req.cookies['ticket'] || req.header('token'));

  if(!ticket) {
    return false;
  }

  const decodeTicket = token.decipher(ticket, config.KEY);

  if(!decodeTicket) {
    return false;
  }

  return decodeTicket;
};

Login.getUserInfo = function(req, cb){
  const userId = req.ex.userId;

  let info = {};

  redisClient.get(userId, function(err, r) {
    if(err) {
      return cb && cb(err);
    }

    if(r){
      info = JSON.parse(r);
      return cb &&cb(null, info);
    }

    userInfo.getUserInfo(userId, function(err, doc) {
      if(err) {
        return cb && cb(err);
      }

      if(!doc) {
        return cb && cb(i18n.t('loginCannotFindUser'));
      }

      userService.getAllPermissions(doc, function(err, result){
        if(err){
          return cb && cb(err);
        }
        info = doc;
        info.permissions = result;
        redisClient.set(userId, JSON.stringify(info));
        redisClient.EXPIRE(userId, config.redisExpires);
        return cb && cb(null, info);
      })
    });
  })
}

Login.middleware = function(req, res, next) {
  const decodeTicket = Login.isLogin(req);

  if(decodeTicket) {
    const now = new Date().getTime();
    if(decodeTicket[1] > now) { //token有效期内
      req.ex = { userId: decodeTicket[0] };
      req.query = utils.trim(req.query);

      if(!(req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1)) {
        req.body = utils.trim(req.body);
      }

      Login.getUserInfo(req, function(err, info){
        if(err) {
          res.clearCookie('ticket');
          return res.json(result.fail(req.t("loginCannotGetUserInfo")));
        }

        req.ex.userInfo = info;
        next();
      });

    }else { //过期
      res.clearCookie('ticket');
      return res.json(result.fail(req.t("loginExpired")));
    }
  }else {
    res.redirect('/login');
  }

};

Login.hasAccessMiddleware = function(req, res, next) {
  const permissions = req.ex.userInfo.permissions || [];
  const allowedPermissions = permissions.allowedPermissions || [];
  const unActivePermissions = permissions.unActivePermissions || [];
  let url = req.originalUrl;
  url = url.split('?')[0];

  if(allowedPermissions.indexOf(url) !== -1 || allowedPermissions.indexOf('all') !== -1) {
    if(unActivePermissions.indexOf(url) !== -1){
      return res.json(result.fail(req.t("permissionIsUnActive")));
    }
    next();
  }else {
    return res.json(result.fail(req.t("noAccess")));
  }
};

module.exports = Login;
