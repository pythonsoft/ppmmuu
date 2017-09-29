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
const nodecc = require('node-opencc');
const Xml2Srt = require('../../common/parseXmlSub');

const HttpRequest = require('../../common/httpRequest');

const rq = new HttpRequest({
  hostname: config.HKAPI.hostname,
  port: config.HKAPI.port,
});

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
  info.q = nodecc.simplifiedToTraditional(info.q);

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

service.defaultMediaList = function defaultMediaList(cb, userId) {
  const key = 'cachedMediaList';
  redisClient.get(key, (err, obj) => {
    service.getWatchHistoryForMediaPage(userId, (error, r) => {
      if (error) {
        logger.error(error.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (err) {
        logger.error(err.message);
      }
      if (!obj || err) {
        service.getEsMediaList({ pageSize: 12 }, (err, rs) => {
          if (err) {
            logger.error(err.message);
          }
          rs = rs || [];
          redisClient.set(key, JSON.stringify(rs));
          redisClient.EXPIRE(key, 60 * 3);
          rs.push({ category: '瀏覽歷史', docs: r });
          return cb && cb(null, rs);
        });
      } else {
        try {
          obj = JSON.parse(obj);
        } catch (e) {
          return cb && cb(e);
        }
        obj.push({ category: '瀏覽歷史', docs: r });
        return cb && cb(null, obj || []);
      }
    });
  });
};

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

service.getEsMediaList = function getEsMediaList(info, cb) {
  const pageSize = info.pageSize || 4;
  const result = [];

  const loopGetCategoryList = function loopGetCategoryList(categories, index) {
    if (index >= categories.length) {
      return cb && cb(null, result);
    }
    const category = categories[index].label;
    const options = {
      match: [{
        key: 'program_type',
        value: category,
      }],
      source: 'id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify,f_str_03',
      sort: [{
        key: 'last_modify',
        value: 'desc',
      }],
      start: 0,
      pageSize,
    };
    service.esSearch(options, (err, r) => {
      if (err) {
        return cb && cb(err);
      }
      result.push({ category, docs: r.docs });
      loopGetCategoryList(categories, index + 1);
    });
  };
  const key = 'cachedMediaList';
  redisClient.get(key, (err, obj) => {
    if (obj) {
      return cb & cb(null, JSON.parse(obj));
    }
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
  });
};

const getEsOptions = function getEsOptions(info) {
  let match = info.match || [];
  let should = info.should || [];
  const range = info.range || [];
  const hl = info.hl || '';
  const sort = info.sort || [];
  const start = info.start || 0;
  const pageSize = info.pageSize || 24;
  const source = info.source || '';

  // convert simplified to tranditional
  match = JSON.parse(nodecc.simplifiedToTraditional(JSON.stringify(match)));
  should = JSON.parse(nodecc.simplifiedToTraditional(JSON.stringify(should)));
  const getHighLightFields = function getHighLightFields(fields) {
    const obj = {};
    fields = fields.split(',');
    for (let i = 0, len = fields.length; i < len; i++) {
      obj[fields[i]] = {};
    }
    return obj;
  };

  const formatMust = function formatMust(arr) {
    const rs = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      const temp = arr[i];
      if (temp.value) {
        const item = {
          match: {},
        };
        item.match[temp.key] = temp.value;
        rs.push(item);
      }
    }
    return rs;
  };

  const formatSort = function formatSort(arr) {
    const rs = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      const temp = arr[i];
      if (temp.value) {
        const item = {};
        item[temp.key] = {
          order: temp.value,
        };
        rs.push(item);
      }
    }
    return rs;
  };

  const formatRange = function formatRange(arr, must) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (arr[i].key && (arr[i].gte || arr[i].lt)) {
        const rs = { range: {} };
        rs.range[arr[i].key] = {};
        if (arr[i].gte) {
          rs.range[arr[i].key].gte = arr[i].gte;
        }
        if (arr[i].lt) {
          rs.range[arr[i].key].lt = arr[i].lt;
        }
        must.push(rs);
      }
    }
  };

  const must = formatMust(match);
  const shoulds = formatMust(should);
  const sorts = formatSort(sort);
  const highlight = getHighLightFields(hl);
  formatRange(range, must);

  const options = {
    _source: source.split(','),
    from: start * 1,
    size: pageSize * 1,
  };

  if (must.length && shoulds.length) {
    options.query = {
      bool: {
        must,
        should: shoulds,
      },
    };
  } else if (must.length) {
    options.query = {
      bool: {
        must,
      },
    };
  } else if (shoulds.length) {
    options.query = {
      bool: {
        should: shoulds,
      },
    };
  }

  if (sorts.length) {
    options.sort = sorts;
  }

  if (!utils.isEmptyObject(highlight)) {
    options.highlight = {
      require_field_match: false,
      fields: highlight,
    };
  }

  return options;
};

service.esSearch = function esSearch(info, cb, userId, videoIds) {
  // search by videoId will overwrite original keywords
  const match = info.match || [];
  if (videoIds) {
    videoIds = videoIds.split(',').join(' ');
    info.match = [{ _id: videoIds }];
  }
  const body = getEsOptions(info);
  const url = `${config.esBaseUrl}es/program/_search`;
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
      numFound: rs.hits.total,
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
      newRs.docs.push(_source);
    }

    let fullText = '';
    for (let i = 0, len = match.length; i < len; i++) {
      if (match[i].key === 'full_text') {
        fullText = match[i].value;
        break;
      }
    }
    if (userId && fullText) {
      saveSearch(fullText, userId, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    }

    return cb && cb(null, newRs);
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

service.xml2srt = (info, cb) => {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb(err);
  }

  const options = {
    uri: `${config.hongkongUrl}get_subtitle`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };

  request(options, (error, response) => {
    if (error) {
      logger.error(error);
      return cb(i18n.t('getSubtitleError', { error }));
    }

    if (response.statusCode !== 200) {
      logger.error(response.body);
      return cb(i18n.t('getSubtitleFailed'));
    }

    const rs = JSON.parse(response.body);
    rs.status = '0';

    if (Object.keys(rs.result).length === 0) {
      rs.result = '';
    }

    const parser = new Xml2Srt(rs.result);
    parser.getSrtStr((err, r) => {
      if (err) {
        logger.error(err);
        return cb(i18n.t('getSubtitleFailed'));
      }
      rs.result = r;
      return cb(null, rs);
    });
  });
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
  searchHistoryInfo.pagination({ userId }, page, pageSize, (err, doc) => cb && cb(err, doc), '-updatedTime', null);
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
  watchingHistoryInfo.pagination({ userId, status: 'available' }, page, pageSize, (err, doc) => cb && cb(err, doc), '-updatedTime', '');
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
