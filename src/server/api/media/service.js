/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const config = require('../../config');
const request = require('request');
const fieldConfig = require('./fieldConfig');
const ConfigurationInfo = require('../configuration/configurationInfo');
const SearchHistoryInfo = require('../user/searchHistoryInfo');
const WatchingHistoryInfo = require('../user/watchingHistoryInfo');
const uuid = require('uuid');
const OpenCC = require('opencc');

const HttpRequest = require('../../common/httpRequest');

const rq = new HttpRequest({
  hostname: config.HKAPI.hostname,
  port: config.HKAPI.port,
});

const opencc = new OpenCC('s2t.json');

const configurationInfo = new ConfigurationInfo();
const searchHistoryInfo = new SearchHistoryInfo();
const watchingHistoryInfo = new WatchingHistoryInfo();
const service = {};

const redisClient = config.redisClient;

service.getSearchConfig = function getSearchConfig(cb) {
  configurationInfo.collection.find({ key: { $in: ['meidaCenterSearchSelects', 'mediaCenterSearchRadios'] } }, { fields: { key: 1, value: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const rs = {
      searchSelectConfigs: [],
      searchRadioboxConfigs: [],
    };

    for (let i = 0, len = docs.length; i < len; i++) {
      if (docs[i].key === 'meidaCenterSearchSelects') {
        try {
          rs.searchSelectConfigs = JSON.parse(docs[i].value);
        } catch (e) {
          return cb && cb(i18n.t('getMeidaCenterSearchConfigsJSONError'));
        }
      } else {
        try {
          rs.searchRadioboxConfigs = JSON.parse(docs[i].value);
        } catch (e) {
          return cb && cb(i18n.t('getMeidaCenterSearchConfigsJSONError'));
        }
      }
    }

    return cb && cb(null, rs);
  });
};

function saveSearch(k, id, cb) {
  searchHistoryInfo.findOneAndUpdate({ keyword: k, userId: id },
    { $set: { updatedTime: new Date() }, $inc: { count: 1 }, $setOnInsert: { _id: uuid.v1() } },
    { returnOriginal: false, upsert: true },
    (err, r) => cb && cb(err, r));
}

service.solrSearch = function solrSearch(info, cb, userId, videoIds) {
  if (!info.wt) {
    info.wt = 'json';
  }
  const struct = {
    wt: { type: 'string', validation(v) { v = v.trim().toLowerCase(); if (v !== 'json' && v !== 'xml') { return false; } return true; } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  info.wt = info.wt.trim().toLowerCase();

  // convert simplified to tranditional
  info.q = opencc.convertSync(info.q);

  // search by videoId will overwrite original keywords
  if (videoIds) {
    const vIdL = videoIds.split(',');
    const newQ = vIdL.length === 1 ? `id: ${vIdL[0]}` : `id: ${vIdL.join(' OR id: ')}`;
    info.q = newQ;
  }

  const options = {
    uri: `${config.solrBaseUrl}program/select`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };
  const t1 = new Date().getTime();
  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      const rs = JSON.parse(response.body);
      let r = {};
      if (rs.response) {
        const highlighting = rs.highlighting || {};
        r.QTime = rs.responseHeader ? rs.responseHeader.QTime : (new Date().getTime() - t1);
        r = Object.assign(r, rs.response);
        if (!utils.isEmptyObject(highlighting)) {
          const docs = r.docs;
          for (let i = 0, len = docs.length; i < len; i++) {
            const doc = docs[i];
            const hl = highlighting[doc.id];
            if (!utils.isEmptyObject(hl)) {
              for (const key in hl) {
                doc[key] = hl[key].join('') || doc[key];
              }
            }
          }
        }
        if (userId && info.q.lastIndexOf('full_text:') !== -1) {
          const k = info.q.substring(info.q.lastIndexOf('full_text:') + 10, info.q.indexOf(' '));
          saveSearch(k, userId, (err) => {
            if (err) {
              logger.error(err);
            }
          });
        }
        return cb && cb(null, r);
      }
      return cb && cb(i18n.t('solrSearchError', { error: rs.error.msg }));
    } else if (error) {
      logger.error(error);
      return cb && cb(i18n.t('solrSearchError', { error }));
    }
    logger.error(response.body);
    return cb && cb(i18n.t('solrSearchFailed'));
  });
};

service.defaultMediaList = function defaultMediaList(cb) {
  redisClient.get('cachedMediaList', (err, obj) => {
    if (err) {
      logger.error(err);
      return cb && cb(err);
    }

    return cb && cb(null, JSON.parse(obj || '[]'));
  });
}
;

service.getMediaList = function getMediaList(info, cb) {
  const pageSize = info.pageSize || 4;
  const result = [];

  const loopGetCategoryList = function loopGetCategoryList(categories, index) {
    if (index >= categories.length) {
      return cb && cb(null, result);
    }
    const category = categories[index].label;
    const query = {
      q: `program_type:${category}`,
      fl: 'id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify,f_str_03',
      sort: 'last_modify desc',
      start: 0,
      rows: pageSize,
      hl: 'off',
    };
    service.solrSearch(query, (err, r) => {
      if (err) {
        return cb && cb(err);
      }
      result.push({ category, docs: r.docs });
      loopGetCategoryList(categories, index + 1);
    });
  };

  service.getSearchConfig((err, rs) => {
    if (err) {
      return cb && cb(i18n.t('databaseError'));
    }

    if (!rs.searchSelectConfigs.length) {
      return cb & cb(null, result);
    }

    const categories = rs.searchSelectConfigs[0].items;

    if (!categories.length) {
      return cb & cb(null, result);
    }

    loopGetCategoryList(categories, 0);
  });
};

service.getIcon = function getIcon(info, res) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };

  const err = utils.validation(info, struct);

  if (err) {
    res.end(err.message);
  }

  request.get(`${config.hongkongUrl}get_preview?objectid=${info.objectid}`).on('error', (error) => {
    logger.error(error);
    res.end(error.message);
  }).pipe(res);
};

service.getObject = function getObject(info, cb) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb(err.message);
  }

  const options = {
    uri: `${config.hongkongUrl}get_object`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };

  request(options, (error, response) => {
    if (error) {
      logger.error(error);
      return cb(i18n.t('getObjectError', { error }));
    }

    if (response.statusCode !== 200) {
      logger.error(response.body);
      return cb(i18n.t('getObjectFailed'));
    }

    const rs = JSON.parse(response.body);
    rs.status = '0';

    if (rs.result.detail && rs.result.detail.program) {
      const program = rs.result.detail.program;
      const files = rs.result.files;

      for (const key in program) {
        if (program[key] === '' || program[key] === null) {
          delete program[key];
        } else {
          program[key] = { value: program[key], cn: fieldConfig[key] ? fieldConfig[key].cn : '' };
        }
      }

      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        for (const k in file) {
          if (file[k] === null || file[k] === '') {
            delete file[k];
          }
        }
      }
    }

    return cb(null, rs);
  });
};

service.saveWatching = function saveWatching(userId, videoId, cb) {
  watchingHistoryInfo.findOneAndUpdate(
    { videoId, userId },
    {
      $set: { updatedTime: new Date() },
      $inc: { count: 1 },
      $setOnInsert: { videoContent: '', status: 'unavailable', _id: uuid.v1() },
    },
    {
      returnOriginal: false,
      upsert: true,
    },
    (err, r) => cb && cb(err, r));
};

service.getStream = function getStream(objectId, res) {
  const struct = {
    objectId: { type: 'string', validation: 'require' },
  };

  const err = utils.validation({ objectId }, struct);

  if (err) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: { code: 10000, message: err.message } }));
  }

  rq.get('/mamapi/get_stream', { objectid: objectId }, res);
};

service.getSearchHistory = (userId, cb, page, pageSize) => {
  searchHistoryInfo.pagination({ userId }, page, pageSize, (err, doc) => cb && cb(err, doc), 'updatedTime', '');
};

service.getSearchHistoryForMediaPage = (userId, cb) => {
  searchHistoryInfo.collection
  .find({ userId })
  .sort({ updatedTime: -1 })
  .limit(10).project({
    keyword: 1,
    updatedTime: 1,
    count: 1,
  })
  .toArray((err, docs) => cb && cb(err, docs));
};

service.getWatchHistory = (userId, cb, page, pageSize) => {
  watchingHistoryInfo.pagination({ userId, status: 'available' }, page, pageSize, (err, doc) => cb && cb(err, doc), 'updatedTime', '');
};

service.getWatchHistoryForMediaPage = (userId, cb) => {
  watchingHistoryInfo.collection
  .find({ userId, status: 'available' })
  .sort({ updatedTime: -1 })
  .limit(10)
  .toArray((err, docs) => {
    const r = [];
    if (docs) {
      docs.forEach((item) => {
        r.push(item.videoContent);
      });
    }
    return cb && cb(err, r);
  });
};

module.exports = service;
