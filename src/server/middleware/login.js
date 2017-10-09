/**
 * Created by chaoningxie on 26/2/17.
 */

'use strict';

const logger = require('../common/log')('error');
const i18n = require('i18next');
const utils = require('../common/utils');
const result = require('../common/result');
const token = require('../common/token');
const config = require('../config');
const UserInfo = require('../api/user/userInfo');
const PermissionInfo = require('../api/role/permissionInfo');
const PermissionAssignmentInfo = require('../api/role/permissionAssignmentInfo');
const groupService = require('../api/group/service');

const userInfo = new UserInfo();
const redisClient = config.redisClient;

const Login = {};

Login.isLogin = function isLogin(req) {
  const query = utils.trim(req.query);
  const ticket = query.ticket || (req.cookies.ticket || req.header('ump-ticket')) || (req.body || req.body.ticket);

  if (!ticket) {
    return false;
  }

  const decodeTicket = token.decipher(ticket, config.KEY);

  if (!decodeTicket) {
    return false;
  }

  return decodeTicket;
};

Login.getUserInfo = function getUserInfo(userId, cb) {
  let info = {};
  userInfo.getUserInfo(userId, '', (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc) {
      return cb && cb(i18n.t('loginCannotFindUser'));
    }

    groupService.getOwnerEffectivePermission({ _id: doc._id, type: PermissionAssignmentInfo.TYPE.USER }, (err, result) => {
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
};

Login.getUserInfoRedis = function getUserInfo(userId, cb) {
  let info = {};

  redisClient.get(userId, (err, r) => {
    if (err) {
      logger.error(JSON.stringify(err));
      Login.getUserInfo(userId, cb);  // 如果redis报错(redis挂了)，那么就去数据库拿，这样的话我们的重新登录功能就会失效
    } else {
      if (r) {
        info = JSON.parse(r);
        return cb && cb(null, info);
      }
      return cb && cb(i18n.t('needReLogin'));
    }
  });
};

Login.middleware = function middleware(req, res, next) {
  const decodeTicket = Login.isLogin(req);

  if (decodeTicket) {
    const now = new Date().getTime();
    if (decodeTicket[1] > now) { // token有效期内
      req.ex = { userId: decodeTicket[0] };
      req.query = utils.trim(req.query);

      if (!(req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1)) {
        req.body = utils.trim(req.body);
      }

      Login.getUserInfoRedis(req.ex.userId, (err, info) => {
        if (err) {
          res.clearCookie('ticket');
          return res.json(result.fail(err));
        }

        req.ex.userInfo = info;
        next();
      });
    } else { // 过期
      res.clearCookie('ticket');
      return res.json(result.fail(req.t('loginExpired')));
    }
  } else {
    return res.json(result.fail(req.t('notLogin')));
  }
};

Login.hasAccessMiddleware = function hasAccessMiddleware(req, res, next) {
  const permissions = req.ex.userInfo.permissions || [];
  let url = req.originalUrl;
  let flag = 0;
  url = url.split('?')[0];

  for (let i = 0, len = permissions.length; i < len; i++) {
    const permission = permissions[i];
    const permissionPath = permission.path;
    const status = permission.status;
    const action = permission.action;
    if (permissionPath === 'all') {    // 'all'是辅助条件
      flag = 1;
      if (status === PermissionInfo.STATUS.UNACTIVE) {
        flag = 0;
      }
      if (action === '拒绝') {
        flag = 0;
      }
    } else if (permissionPath === url) {   // 这个是决定性条件
      flag = 1;
      if (status === PermissionInfo.STATUS.UNACTIVE) {
        flag = 2;
        break;
      }
      if (action === '拒绝') {
        flag = 0;
        break;
      }
    }
  }

  if (flag === 0) {
    return res.json(result.fail(req.t('noAccess')));
  } else if (flag === 1) {
    next();
  } else {
    return res.json(result.fail(req.t('permissionIsUnActive')));
  }
};

module.exports = Login;
