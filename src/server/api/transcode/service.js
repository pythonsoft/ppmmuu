/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const http = require('http');
const writableStream = require('stream').Writable;
const config = require('../../config');

const options = {
  hostname: config.TRANSCODE_API_SERVER.hostname,
  port: config.TRANSCODE_API_SERVER.port,
  protocol: 'http',
};

const request = function request(opt, postData, outStream) {

  const req = http.request(opt, (res) => {
    res.pipe(outStream);
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
    writableStream().write(JSON.stringify({ status: 1, msg: e.message })).pipe(outStream);
    logger.error(e.message);
  });

  req.write(postData);
  req.end();
};

const getData = function getData(path, param, outStream) {
  const opt = utils.clone(options);
  opt.method = 'GET';
  opt.path = path;

  request(opt, param, outStream);
};

const postData = function postData(path, param, outStream) {
  const opt = utils.clone(options);
  opt.method = 'POST';
  opt.path = path;

  request(opt, param, outStream);
};

const service = {};

service.list = function list(status, currentStep, page=1, pageSize=20, res) {
  getData('/TranscodingTask/list', { status, currentStep, page, pageSize }, res);
};

module.exports = service;
