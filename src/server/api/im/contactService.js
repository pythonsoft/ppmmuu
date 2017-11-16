const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const uuid = require('uuid');
const userService = require('../user/service');

const ContactInfo = require('./contactInfo');

const contactInfo = new ContactInfo();

const service = {};

service.add = function (info, ownerId, cb) {
  if (utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('imContactFieldsIsNull', { field: 'info' }));
  }

  if (!info.type) {
    return cb && cb(i18n.t('imContactFieldsIsNull', { field: 'type' }));
  }

  if (!info.ownerId) {
    return cb && cb(i18n.t('imContactFieldsIsNull', { field: 'ownerId' }));
  }

  const t = new Date();

  info.createdTime = t;
  info.modifyTime = t;
  info.ownerId = ownerId;

  const insertOne = function (o) {
    contactInfo.insertOne(o, (err, r) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, o);
    });
  };

  if (info.type !== ContactInfo.TYPE.PERSON) {
    info._id = uuid.v1();

    insertOne(info);
  } else {
    userService.getUsers(info._id, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      if (!docs || docs.length === 0) {
        return cb && cb(i18n.t('imUserIsNotExist'));
      }

      insertOne(info);
    });
  }
};

service.update = function (_id, updateInfo, cb) {
  if (!_id) {
    return cb && cb(i18n.t('imContactFieldsIsNull', { field: '_id' }));
  }

  if (updateInfo._id) {
    delete updateInfo._id;
  }

  contactInfo.updateOne({ _id }, updateInfo, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.list = function (ownerId, type, cb) {
  if (!ownerId) {
    return cb && cb(i18n.t('imContactFieldsIsNull', { field: 'ownerId' }));
  }

  const q = {
    ownerId,
  };

  if (type) {
    q.type = type;
  }

  contactInfo.collection.find(q).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

module.exports = service;
