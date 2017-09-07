/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const i18n = require('i18next');

const HttpRequest = require('../../common/httpRequest');

const request = new HttpRequest({
  hostname: config.JOB_API_SERVER.hostname,
  port: config.JOB_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
});

const service = {};

const errorCall = function(str) {
  return JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t(str) });
};

service.download = function download(downloadParams, res) {
  if(!downloadParams) {
    return res.end(errorCall('joDownloadParamsIsNull'));
  }

  const params = utils.merge({
    objectid: "",
    inpoint: 0,
    outpoint: 0,
    fileName: ''
  }, downloadParams);

  if(!params.objectid) {
    return res.end(errorCall('joDownloadParamsObjectIdIsNull'));
  }

  if(!params.fileName) {
    return res.end(errorCall('joDownloadParamsFileNameIsNull'));
  }

  if(typeof params.inpoint !== 'number' || typeof params.outpoint !== 'number') {
    return res.end(errorCall('joDownloadParamsInpointOrOutpointTypeError'));
  }

  if(params.inpoint < params.outpoint) {
    return res.end(errorCall('joDownloadParamsInpointLessThanOutpointTypeError'));
  }

  request.post('/JobService/download', params, res);
};

module.exports = service;
