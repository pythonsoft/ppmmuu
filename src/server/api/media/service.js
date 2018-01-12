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
const CatalogInfo = require('../library/catalogInfo');
const FileInfo = require('../library/fileInfo');
const uuid = require('uuid');
const nodecc = require('node-opencc');
const Xml2Srt = require('../../common/parseXmlSub');
const fs = require('fs');
const path = require('path');

const HttpRequest = require('../../common/httpRequest');

const rq = new HttpRequest({
  hostname: config.HKAPI.hostname,
  port: config.HKAPI.port,
});

const REDIS_CACHE_MEIDA_LIST = 'cachedMediaList';

const configurationInfo = new ConfigurationInfo();
const searchHistoryInfo = new SearchHistoryInfo();
const watchingHistoryInfo = new WatchingHistoryInfo();

const libraryExtService = require('../library/extService');

const service = {};

const redisClient = config.redisClient;

const ES_FILTER_FIELDS = 'id,duration,name,ccid,program_type,program_name_en,hd_flag,program_name_cn,last_modify,content_introduction,content,news_data,airdata,program_name,from_where,full_text,publish_time,rootid';

service.ES_FILTER_FIELDS = ES_FILTER_FIELDS;

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

service.saveSearch = saveSearch;

const isFromWhereHK = function isFromWhereHK(fromWhere) {
  if (fromWhere === CatalogInfo.FROM_WHERE.MAM || fromWhere === CatalogInfo.FROM_WHERE.DAYANG) {
    return true;
  }
  return false;
};

service.defaultMediaList = function defaultMediaList(cb, userId, size) {
  redisClient.get(REDIS_CACHE_MEIDA_LIST, (err, obj) => {
    service.getWatchHistoryForMediaPage(userId, (error, r) => {
      if (error) {
        logger.error(error.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (err) {
        logger.error(err.message);
      }

      if (err || obj === '[]') {
        service.getEsMediaList({ pageSize: size }, (err, rs) => {
          if (err) {
            logger.error(err.message);
          }

          if (!rs) {
            rs = [];
          }

          rs.push({ category: '瀏覽歷史', docs: r });

          return cb && cb(null, rs);
        });
      } else {
        try {
          obj = JSON.parse(obj);
          obj.map((item) => {
            item.docs = item.docs.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time)).slice(0, size - 10 === 0 ? 10 : size - 10);
            return item;
          });
          obj.push({ category: '瀏覽歷史', docs: r });
          return cb && cb(null, obj || []);
        } catch (e) {
          return cb && cb(e);
        }
      }
    }, size);
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
      }, {
        key: 'publish_status',
        value: 1,
      }],
      source: ES_FILTER_FIELDS,
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

service.getCacheEsMediaList = function getCacheEsMediaList(info, cb) {
  const size = info.pageSize || 10;
  redisClient.get(REDIS_CACHE_MEIDA_LIST, (err, obj) => {
    if (obj) {
      obj = JSON.parse(obj);
      obj.map((item) => {
        item.docs = item.docs.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time)).slice(0, size - 10 === 0 ? 10 : size - 10);
        return item;
      });
      return cb & cb(null, obj);
    }
    service.getEsMediaList(info, cb);
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
  const source = info.source || ES_FILTER_FIELDS;

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

  const formatShould = function formatShould(arr, key) {
    const rs = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      const temp = arr[i];
      if (temp.value) {
        if (temp.key === key) {
          const fullText = temp.value.trim().split(' ');
          const matchPhrase = {};
          matchPhrase[key] = temp.value.trim();
          rs.push({
            match_phrase: matchPhrase,
          });
          for (let j = 0, len1 = fullText.length; j < len1; j++) {
            if (fullText[j]) {
              const item = {
                match: {},
              };
              item.match[key] = fullText[j];
              rs.push(item);
            }
          }
        } else {
          const item = {
            match: {},
          };
          item.match[temp.key] = temp.value;
          rs.push(item);
        }
      }
    }
    return rs;
  };

  const formatMustShould = function formatMustShould(arr, key) {
    const rs = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      const temp = arr[i];
      if (temp.value && temp.key === key) {
        const fullText = temp.value.trim().split(' ');
        for (let j = 0, len1 = fullText.length; j < len1; j++) {
          if (fullText[j]) {
            const item = {
              match: {},
            };
            item.match[key] = fullText[j];
            rs.push(item);
          }
        }
      }
    }
    return rs;
  };

  const formatMustMust = function formatMustMust(arr, key) {
    const rs = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      const temp = arr[i];
      if (temp.value && temp.key !== key) {
        const value = temp.value;
        const item = {};
        if (value.constructor.name.toLowerCase() === 'array') {
          if (value.length === 0) {
            continue;
          }
          item.terms = {};
          item.terms[temp.key] = value;
        } else {
          item.match = {};
          item.match[temp.key] = value;
        }
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

  const must = formatMustMust(match, 'full_text');
  const mustShould = formatMustShould(match, 'full_text');
  const shoulds = formatShould(should, 'full_name');
  const sorts = formatSort(sort);
  const highlight = getHighLightFields(hl);
  formatRange(range, must);

  const options = {
    _source: source.split(','),
    from: start * 1,
    size: pageSize * 1,
  };

  if (must.length && mustShould.length) {
    const percent = mustShould.length > 1 ? '75%' : '100%';
    options.query = {
      bool: {
        must: {
          bool: {
            should: mustShould,
            minimum_should_match: percent,
            must,
          },
        },
      },
    };
  } else if (must.length) {
    options.query = {
      bool: {
        must: {
          bool: {
            must,
          },
        },
      },
    };
  } else if (mustShould.length) {
    options.query = {
      bool: {
        must: {
          bool: {
            should: mustShould,
            minimum_should_match: '75%',
          },
        },
      },
    };
  }

  if (shoulds.length) {
    if (options.query) {
      options.query.bool.should = shoulds;
    } else {
      options.query = {
        bool: {
          should: shoulds,
        },
      };
    }
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
  const isRelated = info.isRelated || false;

  if (videoIds) {
    videoIds = videoIds.split(',').join(' ');
    info.match = [{ _id: videoIds }];
  }

  const body = getEsOptions(info);
  const url = `${config.esBaseUrl}global_es/_search`;
  const options = {
    method: 'POST',
    url,
    body,
    json: true,
  };
  // console.log(JSON.stringify(body));

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

    if (userId && fullText && !isRelated) {
      saveSearch(fullText, userId, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    }

    return cb && cb(null, newRs);
  });
};

const formatPathToUrl = function formatPathToUrl(path, fileName, mapPath) {
  if (path) {
    const temp = path.match(/\/[a-z,0-9,-,_]*\/\d{4}\/\d{2}\/\d{2}.*/g);
    if (!temp) {
      path = path.replace('\\', '\\\\').match(/\\\d{4}\\\d{2}\\\d{2}/g);
    } else {
      path = temp;
    }

    if (path && path.length === 1) {
      path = path[0].replace(/\\/g, '\/');
    }

    if (mapPath && path) {
      return `${config.streamURL}${mapPath}${path}`;
    }
    return '';
  }
  return '';
};

service.getIcon = function getIcon(info, res) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };

  const err = utils.validation(info, struct);

  if (err) {
    return res.end(err.message);
  }

  const fromWhere = info.fromWhere || CatalogInfo.FROM_WHERE.MAM;

  if (isFromWhereHK(fromWhere)) {
    request.get(`${config.hongkongUrl}get_preview?objectid=${info.objectid}`).on('error', (error) => {
      logger.error(error);
      res.end(error.message);
    }).pipe(res);
  } else {
    libraryExtService.getFileInfo({ catalogId: info.objectid, type: FileInfo.TYPE.THUMB, fromWhere }, (err, doc) => {
      if (err) {
        return res.end(err.message);
      }
      libraryExtService.getMapPath(fromWhere, (err, mapPath) => {
        if (err) {
          return res.end(err.message);
        }
        try {
          const streamUrl = formatPathToUrl(doc.realPath, doc.name, mapPath);
          if (!streamUrl) {
            return res.end('');
          }
          // const streamUrl = `${config.streamURL}${config.hkRuku}/moved/2017/11/24/PMELOOP10_77/transcoding_PMELOOP10_77.jpg`;
          request.get(streamUrl).on('error', (error) => {
            logger.error(error);
            res.end(error.message);
          }).pipe(res);
        } catch (e) {
          return res.end(e.message);
        }
      });
    });
  }
};

service.xml2srt = (info, cb) => {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb(err);
  }

  const fromWhere = info.fromWhere || CatalogInfo.FROM_WHERE.MAM;

  if (isFromWhereHK(fromWhere)) {
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
        return cb(null, r);
      });
    });
  } else {
    libraryExtService.getFileInfo({ catalogId: info.objectid, type: FileInfo.TYPE.OTHER, fromWhere }, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }
      libraryExtService.getMapPath(fromWhere, (err, mapPath) => {
        if (err) {
          return cb && cb(err);
        }
        try {
          const xmlUrl = formatPathToUrl(doc.realPath, doc.name, mapPath);
          if (!xmlUrl) {
            return cb && cb(null, '');
          }
          // const xmlUrl = `${config.streamURL}${config.hkRuku}/moved/2017/11/24/PMELOOP10_77/catalog.xml`;
          const tempXmlPath = path.join(config.uploadPath, uuid.v1());
          utils.download(xmlUrl, tempXmlPath, (error) => {
            if (error) {
              return cb && cb(i18n.t('getSubtitleFailed'));
            }
            const data = fs.readFileSync(tempXmlPath, 'utf-8');
            const parser = new Xml2Srt(data);
            parser.getSrtStr((err, r) => {
              if (err) {
                logger.error(err);
                return cb(i18n.t('getSubtitleFailed'));
              }
              return cb(null, r);
            });
          });
        } catch (e) {
          return cb && cb(null, '');
        }
      });
    });
  }
};

const getObjectFromHK = function getObjectFromHK(info, cb) {
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
          if (typeof program[key] === 'string' && program[key].match('\\d{4}-\\d{2}-\\d{2}')) {
            if (new Date(program[key]) < new Date('1900-01-01')) {
              program[key] = 'N/A';
            }
          }
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

    if (rs.result.detail && rs.result.detail.sequence) {
      const sequence = rs.result.detail.sequence;

      for (const key in sequence) {
        if (sequence[key] === '' || sequence[key] === null) {
          delete sequence[key];
        } else {
          if (typeof sequence[key] === 'string' && sequence[key].match('\\d{4}-\\d{2}-\\d{2}')) {
            if (new Date(sequence[key]) < new Date('1900-01-01')) {
              sequence[key] = 'N/A';
            }
          }
          sequence[key] = { value: sequence[key], cn: fieldConfig[key] ? fieldConfig[key].cn : '' };
        }
      }
    }

    return cb(null, rs, 'mam');
  });
};

service.getObject = function getObject(info, cb) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  const fromWhere = info.fromWhere || CatalogInfo.FROM_WHERE.MAM;

  if (err) {
    return cb(err);
  }

  if (!isFromWhereHK(fromWhere)) {
    libraryExtService.getObject(info.objectid, cb);
  } else {
    getObjectFromHK(info, cb);
  }
};

service.saveWatching = function saveWatching(userId, videoId, fromWhere, cb) {
  watchingHistoryInfo.findOneAndUpdate(
      { videoId, userId },
    {
      $set: { updatedTime: new Date(), fromWhere: fromWhere || CatalogInfo.FROM_WHERE.MAM },
      $inc: { count: 1 },
      $setOnInsert: { videoContent: '', status: 'unavailable', _id: uuid.v1() },
    },
    {
      returnOriginal: false,
      upsert: true,
    },
      (err, r) => cb && cb(err, r));
};

service.getStream = function getStream(objectId, fromWhere, res) {
  const struct = {
    objectId: { type: 'string', validation: 'require' },
  };

  const err = utils.validation({ objectId }, struct);

  if (err) {
    const rs = { status: '-10000', result: {}, statusInfo: { code: '-10000', message: err.message } };

    if (typeof res === 'function') {
      return res && res(rs);
    }
    return res.end(JSON.stringify(rs));
  }

  fromWhere = fromWhere || CatalogInfo.FROM_WHERE.MAM;

  if (!isFromWhereHK(fromWhere)) {
    libraryExtService.getCatalogInfo({ catalogId: objectId, type: FileInfo.TYPE.LOW_BIT_VIDEO, fromWhere }, (err, doc) => {
      if (err) {
        return res && res({ status: err.code, result: {}, statusInfo: { message: err.message } });
      }

      libraryExtService.getMapPath(fromWhere, (err, mapPath) => {
        if (err) {
          return res && res({ status: err.code, result: {}, statusInfo: { message: err.message } });
        }

        const rs = {
          FILENAME: '',
          INPOINT: 0,
          OUTPOINT: 0,
          UNCPATH: '',
        };

        rs.FILENAME = doc.fileInfo.name;
        rs.INPOINT = doc.inpoint;
        rs.OUTPOINT = doc.outpoint;
        rs.UNCPATH = doc.fileInfo.realPath;
        rs.mapPath = mapPath;

        return res && res(null, { status: '0', result: rs, statusInfo: { message: 'ok' } });
      });
    });
  } else {
    rq.get('/mamapi/get_stream', { objectid: objectId }, res);
  }
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

service.getWatchHistoryForMediaPage = (userId, cb, size) => {
  watchingHistoryInfo.collection
      .find({ userId, status: 'available' })
      .sort({ updatedTime: -1 })
      .limit(size < 10 ? size : 10)
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
