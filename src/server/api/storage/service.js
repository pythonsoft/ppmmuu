/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');
const config = require('../../config');

const StorageInfo = require('./storageInfo');

const storageInfo = new StorageInfo();

const PathInfo = require('./pathInfo');

const pathInfo = new PathInfo();

const TacticsInfo = require('./tacticsInfo');

const tacticsInfo = new TacticsInfo();

const service = {};

/* storage */
service.listStorage = function listStorage(status, page, pageSize, cb, sortFields, fieldsNeed) {
  const q = {};

  if (status) {
    if(status.indexOf(',')) {
      q.status = { $in: utils.trim(status.split(',')) };
    }else {
      q.status = status;
    }
  }

  storageInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getStorageDetail = function getStorageDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('storageIdIsNull'));
  }

  storageInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.addStorage = function addStorage(info = {}, cb) {
  if (utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('storageInfoIsNull'));
  }

  if (!info.name) {
    return cb && cb(i18n.t('storageNameIsNull'));
  }

  const time = new Date();
  info.createdTime = time;
  info.modifyTime = time;

  if(!info._id) {
    info._id = uuid.v1();
  }

  storageInfo.collection.insertOne(storageInfo.assign(info), (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateStorage = function updateStorage(id, info, cb) {
  if (!id) {
    return cb && cb(i18n.t('storageIdIsNull'));
  }

  const updateDoc = storageInfo.updateAssign(info);
  updateDoc.modifyTime = new Date();

  storageInfo.collection.findOneAndUpdate({ _id: id }, updateDoc, { projection: { _id: 1 } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!r.value || utils.isEmptyObject(r.value)) {
      return cb && cb(i18n.t('storageInfoIsNull'));
    }

    cb && cb(null, r.value);
  });

};

service.deleteRoles = function deleteRoles(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.assignRole = function assignRole(updateDoc, cb) {
  const _id = updateDoc._id;
  if (!_id) {
    return cb && cb(i18n.t('assignRoleNoId'));
  }

  updateDoc = assignPermission.updateAssign(updateDoc);

  updateDoc.roles = updateDoc.roles || '';
  updateDoc.allowedPermissions = updateDoc.allowedPermissions || '';
  updateDoc.deniedPermissions = updateDoc.deniedPermissions || '';

  updateDoc.roles = utils.trim(updateDoc.roles.split(','));
  updateDoc.allowedPermissions = utils.trim(updateDoc.allowedPermissions.split(','));
  updateDoc.deniedPermissions = utils.trim(updateDoc.deniedPermissions.split(','));

  assignPermission.collection.updateOne({ _id }, { $set: updateDoc }, { upsert: true }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    redisClient.del(_id);
    return cb && cb(null, r);
  });
};

module.exports = service;
