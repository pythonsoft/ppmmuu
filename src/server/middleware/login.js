/**
 * Created by chaoningxie on 26/2/17.
 */
const Utils = require('../common/Utils');
const Result = require('../common/result');
const token = require('../common/token');
const config =  require('../config');
const UserInfo = require('../api/user/userInfo');
const RoleInfo = require("../api/role/roleInfo");
const roleService = require("../api/role/service");
const userInfo = new UserInfo();
const roleInfo = new RoleInfo();
const redisClient = config.redisClient;

let Login = {};

Login.isLogin = function(req) {
  const query = Utils.trim(req.query);
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
  let info = {};
  let userId = req.ex.userId;
  redisClient.get(userId, function(err, r){
    if(err){
      console.log(err.message);
    }
    if(r){
      info = JSON.parse(r);
      return cb &&cb(null, info);
    }else{
      userInfo.collection.findOne({
        _id: userId
      }, { password: 0 }, function(err, doc) {
        if(err) {
          return cb && cb(Utils.err("-1", err.message));
        }

        if(!doc) {
          return cb && cb(Utils.err(req.t('loginCannotFindUser.code'), req.t('loginCannotFindUser.message')))
        }else {
          info = doc;
          info.permissions = [];
          let roles = info.roles || [];
          roleService.getPermissions({name:{$in: roles}}, function(err, permissions){
            if(err){
              return cb && cb(err);
            }
            info.permissions = permissions;
            redisClient.set(userId, JSON.stringify(info));
            redisClient.EXPIRE(userId, config.redisExpires);
            return cb && cb(null, info);
          })
        }
      });
    }
  })
}

Login.middleware = function(req, res, next) {
  const decodeTicket = Login.isLogin(req);
  if(decodeTicket) {
    const now = new Date().getTime();
    if(decodeTicket[1] > now) { //token有效期内
      req.ex = { userId: decodeTicket[0] };
      Login.getUserInfo(req, function(err, info){
        if(err){
          res.clearCookie('ticket');
          return res.json(Result.FAIL(req.t("loginCannotGetUserInfo.code"), {}, req.t("loginCannotGetUserInfo.message")));
        }

        req.ex.userInfo = info;
        next();
      })
    }else { //过期
      res.clearCookie('ticket');
      return res.json(Result.FAIL(req.t("loginExpired.code"), {}, req.t("loginExpired.message")));
    }
  }else {
    return res.json(Result.FAIL(req.t("notLogin.code"), {}, req.t("notLogin.message")));
  }

};

Login.hasAccessMiddleware = function(req, res, next){
  let permissions = req.ex.userInfo.permissions || [];
  let url = req.originalUrl;
  if(permissions.indexOf(url) != -1 || permissions.indexOf('all') != -1){
    next();
  }else{
    return res.json(Result.FAIL(req.t("noAccess.code"), {}, req.t("noAccess.message")))
  }
}

module.exports = Login;
