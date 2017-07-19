/**
 * Created by chaoningxie on 26/2/17.
 */

'use strict';

const i18n = require('i18next');
const utils = require('../common/utils');
const result = require('../common/result');
const token = require('../common/token');
const config = require('../config');
const UserInfo = require('../api/user/userInfo');
const PermissionInfo = require('../api/role/permissionInfo');
const groupService = require('../api/group/service');

const userInfo = new UserInfo();
const redisClient = config.redisClient;

const Login = {};

Login.isLogin = function isLogin(req) {
  const query = utils.trim(req.query);
  const ticket = query.ticket || (req.cookies.ticket || req.header('token'));
  console.log('ticket===>', ticket);

  if (!ticket) {
    return false;
  }

  const decodeTicket = token.decipher(ticket, config.KEY);

  if (!decodeTicket) {
    return false;
  }

  return decodeTicket;
};

Login.getUserInfo = function getUserInfo(req, cb) {
  const userId = req.ex.userId;

  let info = {};

  redisClient.get(userId, (err, r) => {
    if (err) {
      return cb && cb(err);
    }

    if (r) {
      info = JSON.parse(r);
      return cb && cb(null, info);
    }

    userInfo.getUserInfo(userId, '', (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      if (!doc) {
        return cb && cb(i18n.t('loginCannotFindUser'));
      }
  
      groupService.getAllPermissions(doc, (err, result) => {
        if (err) {
          return cb && cb(err);
        }
        info = doc;
        info.permissions = result;
        redisClient.set(userId, JSON.stringify(info));
        redisClient.EXPIRE(userId, config.redisExpires);
        return cb && cb(null, info);
      });
    });
  });
};

Login.middleware = function middleware(req, res, next) {
  const decodeTicket = Login.isLogin(req);
  console.log(decodeTicket);

  if (decodeTicket) {
    const now = new Date().getTime();
    if (decodeTicket[1] > now) { // token有效期内
      req.ex = { userId: decodeTicket[0] };
      req.query = utils.trim(req.query);

      if (!(req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1)) {
        req.body = utils.trim(req.body);
      }

      Login.getUserInfo(req, (err, info) => {
        if (err) {
          res.clearCookie('ticket');
          return res.json(result.fail(req.t('loginCannotGetUserInfo')));
        }

        req.ex.userInfo = info;
        next();
      });
    } else { // 过期
      res.clearCookie('ticket');
      return res.json(result.fail(req.t('loginExpired')));
    }
  } else {
    res.redirect('/login');
  }
};

Login.hasAccessMiddleware = function hasAccessMiddleware(req, res, next) {
  const permissions = req.ex.userInfo.permissions || [];
  let url = req.originalUrl;
  url = url.split('?')[0];
  for(let i = 0, len = permissions.length; i < len; i++){
    const permission = permissions[i];
    const permissionPath = permission.path;
    const status = permission.status;
    let flag = 0;
    if(permissionPath === 'all'){    //'all'是辅助条件
      if(status === PermissionInfo.STATUS.UNACTIVE){
        flag = 2;
      }else{
        flag = 1;
      }
    }else if(permissionPath === url){   //这个是决定性条件
      if(status === PermissionInfo.STATUS.UNACTIVE){
        flag = 2;
        break;
      }else{
        flag = 1;
        break;
      }
    }
    
    if(flag === 0){
      return res.json(result.fail(req.t('noAccess')));
    }else if(flag === 1){
      next();
    }else{
      return res.json(result.fail(req.t('permissionIsUnActive')));
    }
  }
};

module.exports = Login;
