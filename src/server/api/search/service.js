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
      console.log('rs==>', rs.response);
      let result = {};
      if (rs.response) {
        result.QTime = rs.responseHeader ? rs.responseHeader.QTime : (new Date().getTime() - t1);
        result = Object.assign(result, rs.response);
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


service.getIcon = function getIcon(info, res) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    res.end(err.message);
  }

  request
    .get(`${config.hongkongUrl}get_preview?objectid=${info.objectid}`)
    .on('error', (error) => {
      logger.error(error);
      res.end(error);
    })
    .pipe(res);
};

service.getObject = function getObject(info, res) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    res.end(err.message);
  }

  const options = {
    uri: `${config.hongkongUrl}get_object`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };
  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      return res.json(JSON.parse(response.body));
    } else if (error) {
      logger.error(error);
      return res.json(result.json(i18n.t('getObjectError', { error }), null));
    }
    logger.error(response.body);
    return res.json(result.json(i18n.t('getObjectFailed'), null));
  });
};

module.exports = service;
