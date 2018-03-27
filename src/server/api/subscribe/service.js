/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const nodecc = require('node-opencc');
const config = require('../../config');
const fieldConfig = require('./fieldConfig');

const SubscribeInfo = require('../subscribeManagement/subscribeInfo');
const SubscribeType = require('../subscribeManagement/subscribeType');
const ShelfInfo = require('../shelves/shelfTaskInfo');
const ConfigurationInfo = require('../configuration/configurationInfo');
const CatalogInfo = require('../library/catalogInfo');
const FileInfo = require('../library/fileInfo');

const subscribeInfo = new SubscribeInfo();
const subscribeType = new SubscribeType();
const shelfInfo = new ShelfInfo();
const configurationInfo = new ConfigurationInfo();

const mediaService = require('../media/service');
const shelfService = require('../shelves/service');

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

const getValidFiles = function getValidFiles(files) {
  const validFiles = [];
  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i];
    const validTypes = [FileInfo.TYPE.P1080, FileInfo.TYPE.P360, FileInfo.TYPE.AUDIO];
    if (file.type && validTypes.indexOf(file.type) !== -1) {
      if (file.type === FileInfo.TYPE.P1080) {
        file.typeName = '全高清';
      } else if (file.type === FileInfo.TYPE.P360) {
        file.typeName = '标清';
      } else {
        file.typeName = '音频';
      }
      validFiles.push(file);
    }
  }
  return validFiles;
};

const filterDoc = function filterDoc(_source) {
  const doc = {};
  doc._id = _source._id;
  doc.name = _source.details.NAME;
  doc.objectId = _source.objectId;
  doc.programNO = _source.programNO;
  doc.newsTime = _source.details.FIELD162 || null;
  doc.playTime = _source.details.FIELD36 || null;
  doc.viceTitle = _source.details.FIELD197 || null;
  doc.storageTime = _source.lastModifyTime;
  doc.source = _source.editorInfo.source;
  doc.limit = _source.editorInfo.limit;
  doc.poster = _source.editorInfo.cover;
  doc.inpoint = _source.details.INPOINT;
  doc.outpoint = _source.details.OUTPOINT;
  doc.duration = _source.details.OUTPOINT - _source.details.INPOINT;
  const files = _source.files || [];
  doc.files = getValidFiles(files);
  doc.fromWhere = _source.fromWhere || CatalogInfo.FROM_WHERE.MAM;
  doc.content = _source.details.FIELD03 || _source.details.FIELD321 || _source.details.FIELD247;
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

// 是否签订合同
service.hasSubscribeInfo = function hasSubscribeInfo(companyId, cb) {
  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, false);
    }
    return cb && cb(null, true);
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
      return cb && cb(i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(i18n.t('companySubscribeInfoExpired'));
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
      shelfInfo.collection.aggregate([
        { $match: { 'editorInfo.subscribeType': { $in: subscribeTypes }, status: ShelfInfo.STATUS.ONLINE } },
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
            const temp = r[j]._id;
            if (temp.constructor.name === 'String') {
              if (temp === subscribeType._id) {
                subscribeType.count += r[j].count;
              }
            }
            if (temp.constructor.name === 'Array') {
              if (temp.indexOf(subscribeType._id) !== -1) {
                subscribeType.count += r[j].count;
              }
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
      return cb && cb(i18n.t('noSubscribeSearchConfig'));
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
          return cb && cb(i18n.t('companyHasNoSubscribeInfo'));
        }

        doc = SubscribeInfo.getStatus(doc);
        if (doc.status === SubscribeInfo.STATUS.UNUSED) {
          return cb && cb(i18n.t('companySubscribeInfoUnused'));
        }

        if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
          return cb && cb(i18n.t('companySubscribeInfoExpired'));
        }

        getSubscribeTypes(doc.subscribeType, (err, docs) => {
          if (err) {
            return cb && cb(err);
          }

          if (!docs || docs.length === 0) {
            return cb && cb(i18n.t('companySubscribeInfoNoSubscribeType'));
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

          for (let i = 0, len = configs.length; i < len; i++) {
            const items = configs[i].items;
            if (items && items.length) {
              for (let j = 0, len1 = items.length; j < len1; j++) {
                if (typeof items[j].value === 'object') {
                  items[j].value = utils.cipher(JSON.stringify(items[j].value), config.KEY);
                }
              }
            }
          }

          return cb && cb(null, configs);
        });
      });
    } catch (e) {
      return cb && cb(i18n.t('subscribeSearchConfigInvalidJson'));
    }
  });
};

const executeEsSerach = function executeEsSearch(body, userId, keyword, isRelated, cb) {
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
      _source._id = hits[i]._id;
      for (const key in _source) {
        if (highlight[key]) {
          _source[key] = highlight[key].join('');
        }
      }
      newRs.docs.push(filterDoc(_source));
    }

    if (userId && keyword && !isRelated) {
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
  const subscribeType = info.subscribeType || '';
  const FIELD323 = info.FIELD323 || '';
  let keyword = info.keyword || '';
  let duration = info.duration || '';
  let sort = info.sort || '';
  let fullTime = info.full_time || '';
  const start = info.start || 0;
  const pageSize = info.pageSize || 28;
  const options = {
    _source: '_id,name,details,editorInfo,lastModifyTime,files,objectId'.split(','),
    from: start * 1,
    size: pageSize * 1,
    sort: [{
      lastModifyTime: {
        order: 'desc',
      },
    }],
  };
  const query = {
    bool: { must: { bool: { must: [], should: [] } } },
  };
  keyword = keyword.trim();
  const musts = query.bool.must.bool.must;
  const shoulds = query.bool.must.bool.should;

  const status = { match: { status: ShelfInfo.STATUS.ONLINE } };
  musts.push(status);

  const getMustShould = function getMustShould(str, field) {
    str = str.split(' ');
    const temp = { terms: {} };
    temp.terms[field] = str;
    musts.push(temp);
  };

  if (keyword) {
    keyword = nodecc.simplifiedToTraditional(keyword);
    keyword = keyword.trim().split(' ');
    for (let i = 0, len = keyword.length; i < len; i++) {
      if (keyword[i]) {
        const temp = { match: { full_text: keyword[i] } };
        shoulds.push(temp);
      }
    }
    if (shoulds.length === 1) {
      query.bool.must.bool.minimum_should_match = '100%';
    } else if (shoulds.length > 1) {
      query.bool.must.bool.minimum_should_match = '75%';
    }
  }
  if (subscribeType) {
    getMustShould(subscribeType, 'editorInfo.subscribeType');
  }
  if (FIELD323) {
    getMustShould(FIELD323, 'details.FIELD323');
  }
  if (duration) {
    try {
      duration = JSON.parse(utils.decipher(duration, config.KEY));
      const temp = { range: { 'details.duration': duration } };
      musts.push(temp);
    } catch (e) {
      // return {err: i18n.t('invalidSearchParams')};
    }
  }
  if (sort && sort !== 'should') {
    try {
      sort = JSON.parse(utils.decipher(sort, config.KEY));
      options.sort = [];
      options.sort.push(sort);
    } catch (e) {
      // return {err: i18n.t('invalidSearchParams')};
    }
  }

  const getDateRange = function getDateRange(str) {
    const strArr = str.split(',');
    const len = strArr.length;
    const rs = {};
    if (len === 1) {
      rs.gte = strArr[0];
    } else {
      if (strArr[0]) {
        rs.gte = strArr[0];
      }
      if (strArr[1]) {
        rs.lt = strArr[1];
      }
    }
    return rs;
  };

  if (fullTime && fullTime.constructor.name.toLowerCase() === 'string') {
    fullTime = getDateRange(fullTime);
    const temp = { range: { lastModifyTime: fullTime } };
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
  const isRelated = info.isRelated || false;
  let subscribeType = info.subscribeType || '';

  // 检查subscribeType是否合法
  subscribeInfo.collection.findOne({ _id: companyId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(i18n.t('companySubscribeInfoExpired'));
    }

    if (subscribeType) {
      subscribeType = subscribeType.split(' ');
      for (let i = 0, len = subscribeType.length; i < len; i++) {
        if (doc.subscribeType.indexOf(subscribeType[i]) === -1) {
          return cb && cb(i18n.t('invalidSubscribeType'));
        }
      }
    }
    if (isRelated && !info.subscribeType) {
      info.subscribeType = doc.subscribeType.join(' ');
    }

    const options = getEsOptions(info);
    let keyword = info.keyword || '';
    keyword = keyword.trim();
    executeEsSerach(options, userInfo._id, keyword, isRelated, (err, docs) => {
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
      category._id = subscribeType[index];
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
      return cb && cb(i18n.t('companyHasNoSubscribeInfo'));
    }

    doc = SubscribeInfo.getStatus(doc);
    if (doc.status === SubscribeInfo.STATUS.UNUSED) {
      return cb && cb(i18n.t('companySubscribeInfoUnused'));
    }

    if (doc.status === SubscribeInfo.STATUS.EXPIRED) {
      return cb && cb(i18n.t('companySubscribeInfoExpired'));
    }

    const subscribeTypes = doc.subscribeType || [];
    if (subscribeTypes.length === 0) {
      return cb && cb(i18n.t('companySubscribeInfoNoSubscribeType'));
    }
    getSubscribeTypes(doc.subscribeType, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      if (!docs || docs.length === 0) {
        return cb && cb(i18n.t('companySubscribeInfoNoSubscribeType'));
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

service.getShelfInfo = function getShelfInfo(req, cb) {
  const _id = req.query._id || '';
  const fields = '_id,name,programNO,objectId,details,editorInfo,lastModifyTime,files,fromWhere';

  const info = {
    _id,
    fields,
    status: ShelfInfo.STATUS.ONLINE,
  };
  shelfService.getShelfDetail(info, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }
    const rs = [];
    doc.fromWhere = doc.fromWhere || CatalogInfo.FROM_WHERE.MAM;
    rs.push({
      key: 'name',
      cn: '节目名称(中文)',
      value: doc.editorInfo.fileName,
    });
    rs.push({
      key: 'subscribeType',
      cn: '订阅类型',
      value: doc.editorInfo.subscribeTypeText,
    });
    rs.push({
      key: 'limit',
      cn: '限制',
      value: doc.editorInfo.limit,
    });
    if (doc.details) {
      rs.push({
        key: 'fileName',
        cn: '文件名',
        value: doc.details.NAME,
      });
      const program = doc.details;
      for (const key in fieldConfig) {
        if (key === 'lastModifyTime') {
          rs.push({
            key,
            cn: fieldConfig[key].cn,
            value: doc.lastModifyTime,
          });
        } else if (key !== 'NAME') {
          rs.push({
            key,
            cn: fieldConfig[key].cn,
            value: program[key] || '',
          });
        }
      }
    }
    const files = doc.files || [];
    doc.details = rs;
    doc.files = getValidFiles(files);
    return cb && cb(null, doc);
  });
};
module.exports = service;
