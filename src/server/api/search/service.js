/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const config = require('../../config');
const request = require('request');

const service = {};

service.solorSearch = function solorSearch(info, cb) {
  const struct = {
    wt: { type: 'string', validation(v) { v = v.trim().toLowerCase(); if (v !== 'json' && v !== 'xml') { return false; } return true; } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  info.wt = info.wt.trim().toLowerCase();

  const options = {
    uri: `${config.solrBaseUrl}collection_core/select`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };
  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      const rs = response.body;
      let result = {};
      if (rs.responseHeader.status === 0) {
        result = rs.response;
        result.QTime = rs.responseHeader.QTime;
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

module.exports = service;
