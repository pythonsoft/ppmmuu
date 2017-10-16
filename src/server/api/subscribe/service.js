/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const SubscribeInfo = require('../subscribeManagement/subscribeInfo');
const SubscribeType = require('../subscribeManagement/subscribeType');
const ShelfInfo = require('../shelves/shelfTaskInfo');

const subscribeInfo = new SubscribeInfo();
const subscribeType = new SubscribeType();
const shelfInfo = new ShelfInfo();

const subscribeManagementService = require('../subscribeManagement/service');
const mediaService = require('../media/service');

const service = {};
const DOWNLOAD_TYPE = {
  AUTO_PUSH: '0',
  HAND_PUSH: '1',
  HAND_DOWNLOAD: '2',
};

const DOWNLOAD_TYPE_MAP = {
  0: '自动推送',
  1: '手动推送',
  2: '手动下载',
};

const getSubscribeTypes = function getSubscribeTypes(_ids, callback) {
  if (_ids.length === 0) {
    return callback && callback(null, []);
  }
  const fields = utils.formatSortOrFieldsParams('name,photo');

  subscribeType.collection.find({ _id: { $in: _ids } }, { fields }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return callback && callback(i18n.t('databaseError'));
    }

    if (!docs) {
      return callback && callback(null, []);
    }

    return callback && callback(null, docs);
  });
};

service.getSubscribeInfo = function getSubscribeInfo(req, cb) {
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;
  const fields = utils.formatSortOrFieldsParams('companyName,subscribeType,downloadSeconds,usedDownloadSeconds,remainDownloadSeconds,startTime,expiredTime');

  subscribeInfo.collection.findOne({ _id: companyId }, { fields }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, {});
    }

    getSubscribeTypes(doc.subscribeType, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      const names = [];
      docs.forEach((doc) => {
        names.push(doc.name);
      });
      doc.subscribeType = names;

      const rs = [];
      for (const key in DOWNLOAD_TYPE_MAP) {
        rs.push(DOWNLOAD_TYPE_MAP[key]);
      }
      doc.downloadType = rs;
      return cb && cb(null, doc);
    });
  });
};


service.getSubscribeTypesSummary = function getSubscribeTypesSummary(req, cb) {
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;
  const rs = {
    total: 0,
    subscribeTypes: [],
  };

  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(null, i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(null, i18n.t('companySubscribeInfoExpired'));
    }

    getSubscribeTypes(doc.subscribeType, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      const subscribeTypes = [];
      docs.forEach((item) => {
        subscribeTypes.push(item._id);
      });
      rs.total = docs.length;
      const t = new Date();
      t.setHours(0);
      t.setMinutes(0);
      t.setSeconds(0);
      shelfInfo.collection.aggregate([
        { $match: { 'editorInfo.subscribeType': { $in: subscribeTypes }, lastModifyTime: { $gte: t }, status: ShelfInfo.STATUS.ONLINE } },
        { $group: { _id: '$editorInfo.subscribeType', count: { $sum: 1 } } },
      ], (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        for (let i = 0, len = docs.length; i < len; i++) {
          const subscribeType = docs[i];
          subscribeType.count = 0;
          for (let j = 0, len1 = r.length; j < len1; j++) {
            if (r[j]._id === subscribeType._id) {
              subscribeType.count = r[j].count;
            }
          }
          rs.subscribeTypes.push(subscribeType);
        }

        return cb && cb(null, rs);
      });
    });
  });
};

service.esSearch = function esSearch(req, cb) {
  const info = req.body;
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;
  let subscribeType = info.subscribeType || [];

  // 检查subscribeType是否合法
  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(null, i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(null, i18n.t('companySubscribeInfoExpired'));
    }

    const query = {};
    if (subscribeType && subscribeType.length) {
      for (let i = 0, len = subscribeType.length; i < len; i++) {
        if (doc.subscribeType.indexOf(subscribeType[i]) === -1) {
          return cb && cb(null, i18n.t('invalidSubscribeType'));
        }
      }
    } else {
      subscribeType = doc.subscribeType;
    }
    return cb && cb(null, { docs: [], numFound: 0 });
  });
};

service.getEsMediaList = function getEsMediaList(req, cb) {
  const info = req.query;
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;
  const pageSize = info.pageSize || 7;
  const rs = {};

  const loopGetShelfTaskInfo = function loopGetShelfTaskInfo(subscribeType, subscribeNames, index, cb) {
    if (index >= subscribeType.length) {
      return cb && cb(null, rs);
    }
    const query = {
      'editorInfo.subscribeType': subscribeType[index],
      status: ShelfInfo.STATUS.ONLINE,
    };

    shelfInfo.pagination(query, 1, pageSize, (err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      const category = {};
      category.key = subscribeNames[index];
      category.total = docs.total;
      category.docs = [];
      docs = docs.docs;
      if (docs && docs.length) {
        docs.forEach((item) => {
          const doc = {};
          doc.name = item.name;
          doc.objectId = item.objectId;
          doc.programNO = item.programNO;
          doc.storageTime = item.lastModifyTime;
          doc.source = item.editorInfo.source;
          doc.limit = item.editorInfo.limit;
          doc.poster = item.cover;
          doc.inpoint = item.details.INPOINT;
          doc.outpoint = item.details.OUTPOINT;
          doc.files = item.files;
          category.docs.push(doc);
        });
        rs.category.push(category);
      }

      loopGetShelfTaskInfo(subscribeType, subscribeNames, index + 1, cb);
    }, '-createdTime');
  };

  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(null, i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(null, i18n.t('companySubscribeInfoExpired'));
    }

    const subscribeTypes = doc.subscribeType || [];
    if (subscribeTypes.length === 0) {
      return cb && cb(null, i18n.t('companySubscribeInfoNoSubscribeType'));
    }
    getSubscribeTypes(doc.subscribeType, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      const subscribeTypes = [];
      const subscribeNames = [];
      docs.forEach((item) => {
        subscribeTypes.push(item._id);
        subscribeNames.push(item.name);
      });

      rs.downloadSeconds = doc.downloadSeconds;
      rs.remainDownloadSeconds = doc.remainDownloadSeconds;
      rs.category = [];
      loopGetShelfTaskInfo(subscribeTypes, subscribeNames, 0, cb);
    });
  });
};
module.exports = service;
