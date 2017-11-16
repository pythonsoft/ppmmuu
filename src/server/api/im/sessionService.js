/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const uuid = require('uuid');
const i18n = require('i18next');
const accountService = require('./accountService');

const SessionInfo = require('./sessionInfo');

const sessionInfo = new SessionInfo();

const service = {};

// 列出含有userId的会话列表
service.list = function (userId, page = 1, pageSize = 50, fieldNeeds, sort = '-modifyTime', cb) {
  if (!userId) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'userId' }));
  }

  sessionInfo.pagination({ 'members._id': userId }, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sort, fieldNeeds);
};

service.add = function (creatorId, info, cb) {
  if (!creatorId) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'creatorId' }));
  }

  if (utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'info' }));
  }

  if (!info._id) {
    info._id = uuid.v1();
  }

  const t = new Date();
  info.createdTime = t;
  info.modifyTime = t;
  info.creatorId = creatorId;

  if (!info.members) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'members' }));
  }

  accountService.getUsers(info.members, (err, users) => {
    if (err) {
      return cb && cb(err);
    }

    info.members = users;

    sessionInfo.insertOne(info, (err, r) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, info);
    });
  });
};

service.addToSession = function (sessionId, userId, cb) {
  if (!sessionId) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'sessionId' }));
  }

  if (!userId) {
    return cb && cb(i18n.t('imSessionFieldsIsNull', { field: 'userId' }));
  }

  sessionInfo.collection.findOne({ _id: sessionId }, { fields: { _id: 1, members: 1 } }, (err, session) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!session) {
      return cb && cb(i18n.t('imSessionIsNotExist'));
    }

    for (let i = 0, len = session.members.length; i < len; i++) {
      if (session.members[i]._id === userId) {
        return cb && cb(i18n.t('imMemberHasBeenSession'));
      }
    }

    accountService.getUsers(userId, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      if (docs && docs.length === 0) {
        return cb && cb(i18n.t('imMemberIsNotExist'));
      }

      sessionInfo.collection.updateOne({ _id: sessionId }, { $push: { members: docs[0] } }, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, r);
      });
    });
  });
};

module.exports = service;
