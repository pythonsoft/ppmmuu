const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const uuid = require('uuid');
const i18n = require('i18next');
const userService = require('../user/service');

const MessageInfo = require('./messageInfo');

const messageInfo = new MessageInfo();

const service = {};

service.add = function (info, cb) {
  if (!utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('imMessageFieldsIsNull', { field: 'info' }));
  }

  info._id = uuid.v1();
  info.createTime = new Date();

  messageInfo.insertOne(info, (err, r) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, info);
  });
};

service.list = function (sessionId, page, pageSize, fieldNeeds, cb) {
  if (!sessionId) {
    return cb && cb(i18n.t('imMessageFieldsIsNull', { field: 'sessionId' }));
  }

  messageInfo.pagination({ sessionId }, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createdTime', fieldNeeds);
};

service.getDetail = function (_id, fields, cb) {
  if (!_id) {
    return cb && cb(i18n.t('imMessageFieldsIsNull', { field: '_id' }));
  }

  const options = {};

  if (fields) {
    options.fields = utils.formatSortOrFieldsParams(fields, false);
  }

  messageInfo.collection.findOne({ _id }, options, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};


module.exports = service;
