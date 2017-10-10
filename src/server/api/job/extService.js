/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const i18n = require('i18next');

const HttpRequest = require('../../common/httpRequest');

const requestTemplate = new HttpRequest({
  hostname: config.TRANSCODE_API_SERVER.hostname,
  port: config.TRANSCODE_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
});

const service = {};

const errorCall = function errorCall(str) {
  return JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t(str) });
};

service.listTemplate = function listTemplate(listTemplateParams, res) {
  if (!listTemplateParams) {
    return res.end(errorCall('jobListTemplateParamsIsNull'));
  }

  const params = utils.merge({
    page: 1,
    pageSize: 99,
  }, listTemplateParams);

  requestTemplate.get('/TemplateService/list', params, res);
};

module.exports = service;
