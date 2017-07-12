/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');
// const config = require('../../config');

const BucketInfo = require('./bucketInfo');

const bucketInfo = new BucketInfo();

const PathInfo = require('./pathInfo');

const pathInfo = new PathInfo();

const TacticsInfo = require('./tacticsInfo');

const tacticsInfo = new TacticsInfo();

const service = {};

/* bucket */
service.listBucket = function listBucket(status, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};

  if (status) {
    if (status.indexOf(',')) {
      q.status = { $in: utils.trim(status.split(',')) };
    } else {
      q.status = status;
    }
  }

  bucketInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getBucketDetail = function getBucketDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('bucketIdIsNull'));
  }

  bucketInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.addBucket = function addBucket(info = {}, cb) {
  if (utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('bucketInfoIsNull'));
  }

  if (!info.name) {
    return cb && cb(i18n.t('bucketNameIsNull'));
  }

  const time = new Date();
  info.createdTime = time;
  info.modifyTime = time;

  if (!info._id) {
    info._id = uuid.v1();
  }

  bucketInfo.collection.insertOne(bucketInfo.assign(info), (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateBucket = function updateBucket(id, info, cb) {
  if (!id) {
    return cb && cb(i18n.t('bucketIdIsNull'));
  }

  const updateDoc = bucketInfo.updateAssign(info);
  updateDoc.modifyTime = new Date();

  bucketInfo.collection.findOneAndUpdate({ _id: id }, updateDoc, { projection: { _id: 1 } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!r.value || utils.isEmptyObject(r.value)) {
      return cb && cb(i18n.t('bucketInfoIsNull'));
    }

    return cb && cb(null, r.value);
  });
};

service.deleteBucket = function deleteBucket(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  bucketInfo.collection.findOne({ _id: id }, { fields: { _id: 1, deleteDeny: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('bucketInfoIsNull'));
    }

    if (doc.deleteDeny === BucketInfo.DELETE_DENY.YES) {
      return cb && cb(i18n.t('bucketDeleteDeny'));
    }

    tacticsInfo.collection.removeMany({ 'source._id': doc._id }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      pathInfo.collection.removeMany({ 'bucket._id': doc._id }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        bucketInfo.collection.removeOne({ _id: doc._id }, (err, r) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, r);
        });
      });
    });
  });
};

/* path */

service.listPath = function listPath(bucketId, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};

  if (bucketId) {
    if (bucketId.indexOf(',')) {
      q['bucket._id'] = { $in: utils.trim(bucketId.split(',')) };
    } else {
      q['bucket._id'] = bucketId;
    }
  }

  pathInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getPathDetail = function getPathDetail(pathId, cb) {
  if (!pathId) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  pathInfo.collection.findOne({ _id: pathId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.addPath = function addPath(bucketId, info, cb) {
  if (!bucketId) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  bucketInfo.collection.findOne({ _id: bucketId }, { fields: { _id: 1, name: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('bucketInfoIsNull'));
    }

    if (utils.isEmptyObject(info)) {
      return cb && cb(i18n.t('PathInfoIsNull'));
    }

    if (!info.name) {
      return cb && cb(i18n.t('PathNameIsNull'));
    }

    if (!info.creator || utils.isEmptyObject(info.creator) || !info.creator._id || !info.creator.name) {
      return cb && cb(i18n.t('PathNameIsNull'));
    }

    if (!info._id) {
      info._id = uuid.v1();
    }

    const time = new Date();

    if (!info.createdTime) {
      info.createdTime = time;
    }

    if (!info.modifyTime) {
      info.modifyTime = time;
    }

    info.bucket = { _id: doc._id, name: doc.name };

    pathInfo.collection.insertOne(pathInfo.assign(info), (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

module.exports = service;
