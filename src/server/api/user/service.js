/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const Token = require('../../common/token');
const config = require('../../config');

const UserInfo = require('./userInfo');

const userInfo = new UserInfo();

const groupUserService = require('../group/userService');

const service = {};

service.login = function login(res, username, password, cb) {
  const cipherPassword = utils.cipher(password, config.KEY);
  const query = {
    name: username,
    password: cipherPassword,
  };

  if (utils.checkEmail(username)) {
    query._id = username;
  }

  userInfo.collection.findOne(query, { fields: { _id: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
    }

    const expires = new Date().getTime() + config.cookieExpires;
    const token = Token.create(doc._id, expires, config.KEY);

    res.cookie('ticket', token, {
      expires: new Date(expires),
      httpOnly: true,
    });

    return cb && cb(null, { token });
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
  const fields = utils.formatSortOrFieldsParams('_id,name,photo,displayName,company,department,team,phone,email');
  fields.password = 0;

  userInfo.collection.findOne({ _id }, { fields }, (err, doc) => {
    if (err) {
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

  userInfo.collection.updateOne({ _id }, { $set: updateInfo }, (err) => {
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

module.exports = service;
