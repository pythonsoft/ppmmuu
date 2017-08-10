/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const config = require('../../config');
const request = require('request');
const result = require('../../common/result');
const fieldConfig = require('./fieldConfig');
const ConfigurationInfo = require('../configuration/configurationInfo');

const configurationInfo = new ConfigurationInfo();
const service = {};

service.solrSearch = function solorSearch(info, cb) {
  if (!info.wt) {
    info.wt = 'json';
  }
  const struct = {
    wt: { type: 'string', validation(v) { v = v.trim().toLowerCase(); if (v !== 'json' && v !== 'xml') { return false; } return true; } },
    q: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  info.wt = info.wt.trim().toLowerCase();

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
      let result = {};
      if (rs.response) {
        const highlighting = rs.highlighting || {};
        result.QTime = rs.responseHeader ? rs.responseHeader.QTime : (new Date().getTime() - t1);
        result = Object.assign(result, rs.response);
        if (!utils.isEmptyObject(highlighting)) {
          const docs = result.docs;
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
        return cb && cb(null, result);
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

service.getSearchConfig = function getSearchConfig(cb) {
  configurationInfo.collection.find({ key: { $in: ['category', 'duration'] } }, { fields: { key: 1, value: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const rs = {
      category: [],
      duration: [],
    };

    for (let i = 0, len = docs.length; i < len; i++) {
      if (docs[i].key === 'category') {
        rs.category = docs[i].value.split(',');
      } else {
        rs.duration = docs[i].value.split(',');
      }
    }

    return cb && cb(null, rs);
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

      for (const key in program) {
        program[key] = { value: program[key], cn: fieldConfig[key] ? fieldConfig[key].cn : '' };
      }
    }

    return cb(null, rs);
  });
};


module.exports = service;
