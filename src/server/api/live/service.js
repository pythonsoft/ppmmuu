/**
 * Created by steven on 2018/4/10.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const config = require('../../config');

const CatalogInfo = require('../library/catalogInfo');

const catalogInfo = new CatalogInfo();

const FileInfo = require('../library/fileInfo');

const fileInfo = new FileInfo();

const libraryExtService = require('../library/extService');

const service = {};

const LIVE_STATUS = {
  NOT_LIVE: '1',  // 录播
  LIVE: '2',      // 直播
};

service.getChannels = function getChannels(cb) {
  catalogInfo.collection.distinct('channel', {}, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs) {
      return cb && cb(null, docs);
    }
    return cb && cb(null, []);
  });
};

service.listProgram = function listProgram(info, cb) {
  const status = info.status || '';
  const time = info.time || '';
  const channel = info.channel || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 999;
  const sortFields = info.sortFields || 'materialTime.from';
  const fieldsNeed = info.fieldsNeed || '_id,name,materialTime';
  const query = {};
  const t = new Date();

  if (status === LIVE_STATUS.NOT_LIVE) {
    query['materialTime.to'] = { $lte: t.toISOString() };
  } else if (status === LIVE_STATUS.LIVE) {
    query['materialTime.from'] = { $lte: t.toISOString() };
    query['materialTime.to'] = { $gt: t.toISOString() };
  }
  if (channel) {
    query.channel = channel;
  } else {
    query.channel = { $exists: true, $ne: '' };
  }

  if (time) {
    const newTime = new Date(time);
    const tomorrow = new Date(time);
    tomorrow.setHours(tomorrow.getHours() + 24);
    query['materialTime.from'] = { $gte: newTime.toISOString(), $lt: tomorrow.toISOString() };
  }

  catalogInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getProgram = function getStream(info, cb) {
  const _id = info._id || '';
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  catalogInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }
    const t = new Date().toISOString();
    if (doc.materialTime.from > t) {
      return cb && cb(i18n.t('liveNotStart'));
    }
    if (doc.materialTime.from <= t && doc.materialTime.to > t) {
      return cb && cb(i18n.t('liveStart'));
    }
    const fromWhere = doc.fromWhere;
    const types = [FileInfo.TYPE.HIGH_VIDEO, FileInfo.TYPE.LOW_BIT_VIDEO];
    fileInfo.collection.find({ objectId: doc.objectId, type: { $in: types } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!docs || docs.length === 0) {
        return cb && cb(i18n.t('fileInfoNotFound'));
      }
      libraryExtService.getMapPath(fromWhere, (err, mapPath) => {
        if (err) {
          return cb && cb(err);
        }
        const result = [];
        for (let i = 0, len = docs.length; i < len; i++) {
          const rs = {
            FILENAME: docs[i].name,
            UNCPATH: docs[i].path,
            mapPath,
          };
          const item = {};
          item.streamUrl = utils.getStreamUrl(rs, fromWhere);
          item.type = docs[i].type;
          item.typeName = FileInfo.TYPE_MAP[item.type];
          item.catalogInfoId = doc._id;
          item.objectId = doc.objectId;
          item.inpoint = doc.inpoint;
          item.outpoint = doc.outpoint;
          item.fromWhere = fromWhere;
          item.fileName = docs[i].name;
          result.push(item);
        }
        return cb && cb(null, result);
      });
    });
  });
};

service.createDownloadUrl = function createDownloadUrl(info, cb) {
  const catalogInfoId = info.catalogInfoId || '';
  const type = info.type || '';
  let expiredTime = info.expiredTime || '';
  const validTypes = [FileInfo.TYPE.P1080, FileInfo.TYPE.P720, FileInfo.TYPE.P360];

  const struct = {
    catalogInfoId: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { if (validTypes.indexOf(v) !== -1) { return true; } return false; } },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  if (!expiredTime) {
    expiredTime = new Date();
    expiredTime.setMinutes(expiredTime.getMinutes() + 30);   // 默认过期时间30分钟
    expiredTime = expiredTime.toISOString();
  }

  const token = utils.cipher(`${type},${expiredTime}`, config.KEY);
  const downloadUrl = `${config.subscribeDownloadUrl}api/download/catalogInfo/file/${catalogInfoId}?token=${token}`;

  return cb && cb(null, downloadUrl);
};
module.exports = service;
