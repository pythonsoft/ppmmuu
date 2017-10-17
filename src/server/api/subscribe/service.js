/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const nodecc = require('node-opencc');
const config = require('../../config');

const SubscribeInfo = require('../subscribeManagement/subscribeInfo');
const SubscribeType = require('../subscribeManagement/subscribeType');
const ShelfInfo = require('../shelves/shelfTaskInfo');
const ConfigurationInfo = require('../configuration/configurationInfo');

const subscribeInfo = new SubscribeInfo();
const subscribeType = new SubscribeType();
const shelfInfo = new ShelfInfo();
const configurationInfo = new ConfigurationInfo();

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

const filterDoc = function filterDoc(_source) {
  const doc = {};
  doc.name = _source.name;
  doc.objectId = _source.objectId;
  doc.programNO = _source.programNO;
  doc.storageTime = _source.lastModifyTime;
  doc.source = _source.editorInfo.source;
  doc.limit = _source.editorInfo.limit;
  doc.poster = _source.editorInfo.cover;
  doc.inpoint = _source.details.INPOINT;
  doc.outpoint = _source.details.OUTPOINT;
  doc.duration = _source.details.OUTPOINT - _source.details.INPOINT;
  doc.files = _source.files;
  return doc;
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

service.getSubscribeSearchConfig = function getSubscribeSearchConfig(req, cb) {
  configurationInfo.collection.findOne({ key: 'subscribeSearchConfig' }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(null, i18n.t('noSubscribeSearchConfig'));
    }
    try {
      const configs = JSON.parse(doc.value);
      const userInfo = req.ex.userInfo;
      const companyId = userInfo.company._id;

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

        getSubscribeTypes(doc.subscribeType, (err, docs) => {
          if (err) {
            return cb && cb(err);
          }

          if (!docs || docs.length === 0) {
            return cb && cb(null, i18n.t('companySubscribeInfoNoSubscribeType'));
          }

          configs.forEach((item) => {
            if (item.key === 'subscribeType') {
              const config = item;
              docs.forEach((item) => {
                const temp = { value: item._id, label: item.name };
                config.items.push(temp);
              });
            }
          });

          return cb && cb(null, configs);
        });
      });
    } catch (e) {
      return cb && cb(null, i18n.t('subscribeSearchConfigInvalidJson'));
    }
  });
};

const executeEsSerach = function executeEsSearch(body, userId, keyword, cb) {
  const url = `${config.esBaseUrl}ump_v1/ShelfTaskInfo/_search`;
  const options = {
    method: 'POST',
    url,
    body,
    json: true,
  };

  utils.commonRequestCallApi(options, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }
    const newRs = {
      docs: [],
      QTime: rs.took,
      total: rs.hits.total,
    };
    const hits = rs.hits.hits || [];
    for (let i = 0, len = hits.length; i < len; i++) {
      const _source = hits[i]._source || {};
      const highlight = hits[i].highlight || {};
      for (const key in _source) {
        if (highlight[key]) {
          _source[key] = highlight[key].join('');
        }
      }
      newRs.docs.push(filterDoc(_source));
    }

    if (userId && keyword) {
      mediaService.saveSearch(keyword, userId, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    }
    return cb && cb(null, newRs);
  });
};

const getEsOptions = function getEsOptions(info) {
  let subscribeType = info.subscribeType || '';
  let FIELD323 = info.FIELD323 || '';
  let keyword = info.keyword || '';
  const duration = info.duration || '';
  const sort = info.sort || '';
  const FIELD162 = info.FIELD162 || '';
  const FIELD36 = info.FIELD36 || '';
  const start = info.start || 0;
  const pageSize = info.pageSize || 28;
  const options = {
    _source: 'name,details,editorInfo,lastModifyTime,files'.split(','),
    from: start * 1,
    size: pageSize * 1,
  };
  const query = {
    bool: { must: [] },
  };
  keyword = keyword.trim();
  const musts = query.bool.must;

  const status = { match: { status: ShelfInfo.STATUS.ONLINE } };
  musts.push(status);

  if (keyword) {
    keyword = nodecc.simplifiedToTraditional(keyword);
    const temp = { match: { full_text: keyword } };
    musts.push(temp);
  }
  if (subscribeType && subscribeType.constructor.name.toLowerCase() === 'array') {
    subscribeType = JSON.parse(nodecc.simplifiedToTraditional(JSON.stringify(subscribeType)));
    const temp = { match: { 'editorInfo.subscribeType': subscribeType.join(' ') } };
    musts.push(temp);
  }
  if (FIELD323 && FIELD323.constructor.name.toLowerCase() === 'array') {
    FIELD323 = JSON.parse(nodecc.simplifiedToTraditional(JSON.stringify(FIELD323)));
    const temp = { match: { 'details.FIELD323': FIELD323.join(' ') } };
    musts.push(temp);
  }
  if (duration && duration.constructor.name.toLowerCase() === 'object') {
    const temp = { range: { 'details.duration': duration } };
    musts.push(temp);
  }
  if (sort && sort.constructor.name.toLowerCase() === 'array') {
    options.sort = sort;
  } else if (sort === 'should' && keyword) {
    query.bool.should = [
      { match: { name: keyword } },
    ];
  }

  if (FIELD162 && FIELD162.constructor.name.toLowerCase() === 'object') {
    const temp = { range: { 'details.FIELD162': FIELD162 } };
    musts.push(temp);
  }
  if (FIELD36 && FIELD36.constructor.name.toLowerCase() === 'object') {
    const temp = { range: { 'details.FIELD36': FIELD36 } };
    musts.push(temp);
  }
  options.query = query;

  const hl = 'name,editorInfo.source,editorInfo.limit';
  const getHighLightFields = function getHighLightFields(fields) {
    const obj = {};
    fields = fields.split(',');
    for (let i = 0, len = fields.length; i < len; i++) {
      obj[fields[i]] = {};
    }
    return obj;
  };
  options.highlight = {
    require_field_match: false,
    fields: getHighLightFields(hl),
  };
  return options;
};

service.esSearch = function esSearch(req, cb) {
  const info = req.body;
  const userInfo = req.ex.userInfo;
  const companyId = userInfo.company._id;
  const subscribeType = info.subscribeType || [];

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

    if (subscribeType && subscribeType.length) {
      for (let i = 0, len = subscribeType.length; i < len; i++) {
        if (doc.subscribeType.indexOf(subscribeType[i]) === -1) {
          return cb && cb(null, i18n.t('invalidSubscribeType'));
        }
      }
    }

    const options = getEsOptions(info);
    let keyword = info.keyword || '';
    keyword = keyword.trim();
    executeEsSerach(options, userInfo._id, keyword, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      
      docs.downloadSeconds = doc.downloadSeconds;
      docs.remainDownloadSeconds = doc.remainDownloadSeconds;

      return cb && cb(null, docs);
    });
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
          category.docs.push(filterDoc(item));
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
      if (!docs || docs.length === 0) {
        return cb && cb(null, i18n.t('companySubscribeInfoNoSubscribeType'));
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
