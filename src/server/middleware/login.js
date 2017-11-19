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
const SubscribeInfo = require('../api/subscribeManagement/subscribeInfo');
const groupService = require('../api/group/service');

const userInfo = new UserInfo();
const subscribeInfo = new SubscribeInfo();
const redisClient = config.redisClient;

const TICKET_COOKIE_NAME = 'ticket';

const login = {};

login.isLogin = function isLogin(req) {
  const query = utils.trim(req.query);
  const ticket = query[TICKET_COOKIE_NAME] || (req.cookies[TICKET_COOKIE_NAME] || req.header(`ump-${TICKET_COOKIE_NAME}`)) || (req.body || req.body[TICKET_COOKIE_NAME]);

  if (!ticket) {
    return false;
  }

  const decodeTicket = token.decipher(ticket, config.KEY);

  if (!decodeTicket) {
    return false;
  }

  return decodeTicket;
};

login.getUserInfo = function getUserInfo(userId, cb) {
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

login.getUserInfoRedis = function getUserInfo(userId, cb) {
  let info = {};

  redisClient.get(userId, (err, r) => {
    if (err) {
      logger.error(JSON.stringify(err));
      login.getUserInfo(userId, cb);  // 如果redis报错(redis挂了)，那么就去数据库拿，这样的话我们的重新登录功能就会失效
    } else {
      if (r) {
        info = JSON.parse(r);
        return cb && cb(null, info);
      }
      return cb && cb(i18n.t('needReLogin'));
    }
  });
};

login.middleware = function middleware(req, res, next) {
  const decodeTicket = login.isLogin(req);

  if (decodeTicket) {
    const now = new Date().getTime();
    if (decodeTicket[1] > now) { // token有效期内
      req.ex = { userId: decodeTicket[0] };
      req.query = utils.trim(req.query);

      if (!(req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1)) {
        req.body = utils.trim(req.body);
      }

      login.getUserInfoRedis(req.ex.userId, (err, info) => {
        if (err) {
          res.clearCookie(TICKET_COOKIE_NAME);
          return res.json(result.fail(err));
        }

        req.ex.userInfo = info;
        next();
      });
    } else { // 过期
      res.clearCookie(TICKET_COOKIE_NAME);
      return res.json(result.fail(req.t('loginExpired')));
    }
  } else {
    return res.json(result.fail(req.t('notLogin')));
  }
};

login.webSocketMiddleware = function (socket) {
  const authorize = socket.request.headers[`ump-${TICKET_COOKIE_NAME}`] || utils.formatCookies(socket.request.headers.cookie)[TICKET_COOKIE_NAME];
  let secret = socket.request.headers['ump-secret'] || '0';

  if (authorize) {
    try {
      const dec = utils.decipher(authorize, config.KEY);
      const codes = dec.split(',');
      const userId = codes[0];
      const expireDate = codes[1];

      const now = new Date().getTime();

      if (expireDate < now) { // 过期
        return result.fail(i18n.t('imLoginDateExpire'));
      }

      secret = secret === '1' ? '1' : '0';

      if (userId) {
        return result.success({ socketId: socket.id, info: { userId, secret } });
      }
      return result.fail(i18n.t('imAuthorizeInvalid'));
    } catch (e) {
      return result.fail(i18n.t('imAuthorizeInvalid'));
    }
  } else {
    return result.fail(i18n.t('imAuthorizeInHeadInvalid'));
  }
};

login.hasAccessMiddleware = function hasAccessMiddleware(req, res, next) {
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

login.hasSubscribeMiddleware = function hasSubscribeMiddleware(req, res, next) {
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;

  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return res.json(i18n.t('databaseError'));
    }

    if (!doc) {
      return res.json(i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return res.json(i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return res.json(i18n.t('companySubscribeInfoExpired'));
    }

    next();
  });
};

module.exports = login;
