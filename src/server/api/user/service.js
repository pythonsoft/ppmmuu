/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const Token = require('../../common/token');
const WebosApi = require('../../common/webosAPI');
const config = require('../../config');
const Login = require('../../middleware/login');

const UserInfo = require('./userInfo');

const userInfo = new UserInfo();

const groupUserService = require('../group/userService');

const service = {};

const generateToken = function generateToken(id, expires) {
  const exp = expires ? expires : new Date().getTime() + config.cookieExpires;
  const token = Token.create(id, exp, config.KEY);

  return token;
};

function setCookie2(res, doc, cb) {
  const expires = new Date().getTime() + config.cookieExpires;
  const token = generateToken(doc._id, expires);

  Login.getUserInfo(doc._id, (err, info) => {
    if (err) {
      return cb && cb(i18n.t('loginCannotGetUserInfo'));
    }

    const permissions = info.permissions || [];
    const menu = permissions.length ? config.adminMenuPermission : config.normalMenuPermission;

    res.cookie('ticket', token, {
      expires: new Date(expires),
      httpOnly: true,
    });

    return cb && cb(null, {
      token,
      menu,
    });
  });
}

function webosLogin(userId, password, cb) {
  const wos = new WebosApi(config.WEBOS_SERVER);
  wos.getTicket(userId, password, (err, r) => {
    if (err) {
      return cb && cb(err);
    }
    const iL = WebosApi.decryptTicket(r, config.WEBOS_SERVER.key);
    if (iL[0] === userId) {
      return cb && cb(null);
    }
    return cb && cb('email not matched');
  });
}

const loginHandle = function loginHandle(username, password, cb) {
  const cipherPassword = utils.cipher(password, config.KEY);

  if (username.indexOf('@') === -1) {
    username = `${username}@phoenixtv.com`;
  }

  if (!utils.checkEmail(username)) {
    return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
  }

  const query = {
    email: username,
  };

  userInfo.collection.findOne(query, {
    fields: {
      _id: 1,
      password: 1,
      verifyType: 1,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
    }

    if (UserInfo.VERIFY_TYPE.PASSWORD === doc.verifyType) {
      if (cipherPassword !== doc.password) {
        return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
      }
      return cb && cb(null, doc);
    } else if (UserInfo.VERIFY_TYPE.WEBOS === doc.verifyType) {
      webosLogin(username, password, (err) => {
        if (err) {
          return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
        }
        return cb && cb(null, doc);
      });
    } else {
      return cb && cb(i18n.t('notImplementedVerityType'));
    }
  });
};

service.getToken = function(res, username, password, cb) {
  loginHandle(username, password, (err, doc) => {
    if(err) {
      return cb && cb(err);
    }

    const token = generateToken(doc._id);
    return cb && cb(null, token);
  });
};

service.login = function login(res, username, password, cb) {
  loginHandle(username, password, (err, doc) => {
    if(err) {
      return cb && cb(err);
    }

    setCookie2(res, doc, (err, doc) => {
      if(err) {
        return cb && cb(err);
      }

      return cb && cb(null, doc);
    });
  });
};

service.setCookie = function setCookie(res, id) {
  const expires = Date.now() + config.cookieExpires;
  const token = Token.create(id, expires, config.KEY);

  res.cookie('ticket', token, {
    expires: new Date(expires),
    httpOnly: true,
  });

  return token;
};

service.getUserDetail = function getUserDetail(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  userInfo.collection.findOne({
    _id,
  }, {
    fields: {
      password: 0,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    groupUserService.getUserGroups(doc, cb);
  });
};

service.updateUser = function updateUser(_id, info, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  const updateInfo = utils.getAllowedUpdateObj('name,displayName,phone,email,photo', info);

  userInfo.collection.updateOne({
    _id,
  }, {
    $set: updateInfo,
  }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.logout = function logout(_id, res, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  res.cookie('ticket', '');
  config.redisClient.del([_id]);
  return cb && cb(null, 'ok');
};

service.changePassword = function changePassword(info, res, cb) {
  const _id = info._id;
  if (!info.password || !utils.checkPassword(info.password)) {
    return cb && cb(i18n.t('oldPasswordIsNotCorrect'));
  }
  if (!info.newPassword || !utils.checkPassword(info.newPassword)) {
    return cb && cb(i18n.t('newPasswordIsNotCorrect'));
  }
  if (info.newPassword !== info.confirmNewPassword) {
    return cb && cb(i18n.t('confirmNewPasswordIsNotCorrect'));
  }

  userInfo.collection.findOne({ _id }, { fields: { password: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    if (utils.cipher(info.password, config.KEY) !== doc.password) {
      return cb && cb(i18n.t('oldPasswordIsNotCorrect'));
    }

    const password = utils.cipher(info.newPassword, config.KEY);
    if (password === doc.password) {
      return cb && cb(i18n.t('newPasswordIsSameWithOldPassword'));
    }

    userInfo.collection.updateOne({ _id }, { $set: { password } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      service.logout(_id, res, cb);
    });
  });
};

module.exports = service;
