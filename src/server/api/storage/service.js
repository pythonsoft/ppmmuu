/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
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
service.listBucket = function listBucket(keyword, status, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};
  status = status === '-1' ? '' : status;

  if (keyword) {
    q.$or = [{
      name: {
        $regex: keyword,
        $options: 'i',
      },
    }, {
      _id: {
        $regex: keyword,
        $options: 'i',
      },
    }];
  }

  if (status) {
    if (status.indexOf(',')) {
      q.status = {
        $in: utils.trim(status.split(',')),
      };
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

  bucketInfo.collection.findOne({
    _id: id,
  }, (err, doc) => {
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

  bucketInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, r.insertedId);
  });
};

service.updateBucket = function updateBucket(id, info = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('bucketIdIsNull'));
  }

  info.modifyTime = new Date();

  bucketInfo.findOneAndUpdate({
    _id: id,
  }, {
    $set: info,
  }, {
    projection: {
      _id: 1,
    },
  }, (err, r) => {
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

service.enableBucket = function enableBucket(id, info = {}, cb) {
  const updateInfo = {};
  if (!id) {
    return cb && cb(i18n.t('bucketIdIsNull'));
  }

  updateInfo.modifyTime = new Date();
  updateInfo.status = info.status;

  bucketInfo.findOneAndUpdate({
    _id: id,
  }, {
    $set: updateInfo,
  }, {
    projection: {
      _id: 1,
    },
  }, (err, r) => {
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

  bucketInfo.collection.findOne({
    _id: id,
  }, {
    fields: {
      _id: 1,
      deleteDeny: 1,
    },
  }, (err, doc) => {
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

    tacticsInfo.collection.removeMany({
      'source._id': doc._id,
    }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      pathInfo.collection.removeMany({
        'bucket._id': doc._id,
      }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        bucketInfo.collection.removeOne({
          _id: doc._id,
        }, (err, r) => {
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

service.listPath = function listPath(bucketId, status, keyword, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};
  status = status === '-1' ? '' : status;

  if (bucketId) {
    if (bucketId.indexOf(',')) {
      q['bucket._id'] = {
        $in: utils.trim(bucketId.split(',')),
      };
    } else {
      q['bucket._id'] = bucketId;
    }
  }

  if (keyword) {
    q.name = {
      $regex: keyword,
      $options: 'i',
    };
  }

  if (status) {
    if (status.indexOf(',')) {
      q.status = {
        $in: utils.trim(status.split(',')),
      };
    } else {
      q.status = status;
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

service.getPathDetail = function getPathDetail(info, cb) {
  const pathId = info._id || '';
  const viceId = info.viceId || '';
  const bucketId = info.bucketId || '';
  const query = {};

  if (pathId) {
    query._id = pathId;
  } else if (viceId && bucketId) {
    query.viceId = viceId;
    query['bucket._id'] = bucketId;
  } else {
    return cb && cb(i18n.t('pathIdOrViceIdAndBucketIdIsNull'));
  }

  pathInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('canNotFindPath'));
    }

    return cb && cb(null, doc);
  });
};

service.addPath = function addPath(bucketId, info = {}, cb) {
  if (!bucketId) {
    return cb && cb(i18n.t('bucketIdIsNull'));
  }

  if (!info._id) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  bucketInfo.collection.findOne({
    _id: bucketId,
  }, {
    fields: {
      _id: 1,
      name: 1,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('bucketInfoIsNull'));
    }

    if (utils.isEmptyObject(info)) {
      return cb && cb(i18n.t('pathInfoIsNull'));
    }

    info.bucket = {
      _id: doc._id,
      name: doc.name,
    };

    pathInfo.insertOne(info, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r.insertedId);
    });
  });
};

service.updatePath = function updatePath(pathId, info = {}, cb) {
  if (!pathId) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  info.modifyTime = new Date();

  if (info._id) {
    delete info._id;
  }

  pathInfo.updateOne({
    _id: pathId,
  }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.enablePath = function enablePath(id, info = {}, cb) {
  const updateInfo = {};
  if (!id) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  updateInfo.modifyTime = new Date();
  updateInfo.status = info.status;

  pathInfo.findOneAndUpdate({
    _id: id,
  }, {
    $set: updateInfo,
  }, {
    projection: {
      _id: 1,
    },
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!r.value || utils.isEmptyObject(r.value)) {
      return cb && cb(i18n.t('pathInfoIsNull'));
    }

    return cb && cb(null, r.value);
  });
};

service.deletePath = function deletePath(pathId, cb) {
  if (!pathId) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  pathInfo.collection.removeOne({
    _id: pathId,
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.getPaths = function getPaths(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('pathIdIsNull'));
  }

  const query = {};

  if (ids.constructor === Array) {
    query._id = {
      $in: ids,
    };
  } else {
    query.id = {
      $in: ids.replace(/\s/g, '').split(','),
    };
  }

  pathInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

/* tactics */

service.listTactics = function listTactics(sourceId, status, keyword, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};
  status = status === '-1' ? '' : status;

  if (sourceId) {
    if (sourceId.indexOf(',')) {
      q['source._id'] = {
        $in: utils.trim(sourceId.split(',')),
      };
    } else {
      q['source._id'] = sourceId;
    }
  }

  if (status) {
    q.status = status;
  }

  if (keyword) {
    q.name = {
      $regex: keyword,
      $options: 'i',
    };
  }


  tacticsInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getTacticsDetail = function getTacticsDetail(tacticsId, cb) {
  if (!tacticsId) {
    return cb && cb(i18n.t('tacticsIdIsNull'));
  }

  tacticsInfo.collection.findOne({
    _id: tacticsId,
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.addTactics = function addTactics(info = {}, cb) {
  if (!info.source || !info.source._id) {
    return cb && cb(i18n.t('sourceIdIsNull'));
  }

  if (!info.source || !info.source.type) {
    return cb && cb(i18n.t('sourceTypeIsNull'));
  }

  if (!utils.isValueInObject(info.source.type, TacticsInfo.SOURCE_TYPE)) {
    return cb && cb(i18n.t('sourceTypeIsNotExist'));
  }

  let col = null;
  let sourceTypeName = '';

  if (info.source.type === TacticsInfo.SOURCE_TYPE.BUCKET) {
    col = bucketInfo;
    sourceTypeName = 'bucket';
  } else if (info.source.type === TacticsInfo.SOURCE_TYPE.PATH) {
    col = pathInfo;
    sourceTypeName = 'path';
  }

  col.collection.findOne({
    _id: info.source._id,
  }, {
    fields: {
      _id: 1,
      name: 1,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t(`${sourceTypeName}InfoIsNull`));
    }

    if (utils.isEmptyObject(info)) {
      return cb && cb(i18n.t(`${sourceTypeName}InfoIsNull`));
    }

    info.source = {
      _id: doc._id,
      name: doc.name,
      type: info.source.type,
    };

    tacticsInfo.insertOne(info, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r.insertedId);
    });
  });
};

service.updateTactics = function updateTactics(tacticsId, info = {}, cb) {
  if (!tacticsId) {
    return cb && cb(i18n.t('tacticsIdIsNull'));
  }

  info.modifyTime = new Date();

  tacticsInfo.updateOne({
    _id: tacticsId,
  }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.enableTactics = function enableTactics(id, info = {}, cb) {
  const updateInfo = {};
  if (!id) {
    return cb && cb(i18n.t('tacticsIdIsNull'));
  }

  updateInfo.modifyTime = new Date();
  updateInfo.status = info.status;

  tacticsInfo.findOneAndUpdate({
    _id: id,
  }, {
    $set: updateInfo,
  }, {
    projection: {
      _id: 1,
    },
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!r.value || utils.isEmptyObject(r.value)) {
      return cb && cb(i18n.t('tacticsInfoIsNull'));
    }

    return cb && cb(null, r.value);
  });
};

service.deleteTactics = function deleteTactics(tacticsId, cb) {
  if (!tacticsId) {
    return cb && cb(i18n.t('tacticsIdIsNull'));
  }

  tacticsInfo.collection.removeOne({
    _id: tacticsId,
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

module.exports = service;
