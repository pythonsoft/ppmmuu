/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const http = require('http');
const config = require('../../config');
const i18n = require('i18next');

const options = {
  hostname: config.TRANSCODE_API_SERVER.hostname,
  port: config.TRANSCODE_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
};

const request = function request(opt, postData, outStream) {
  const req = http.request(opt, (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error = null;

    if (statusCode !== 200) {
      error = new Error(`Request Failed. Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.Expected application/json but received ${contentType}`);
    }

    if (error) {
      console.log('error message =>', error.message);
      logger.error(error.message);
      outStream.end(JSON.stringify({ status: 1, data: {}, statusInfo: { code: '10000', message: error.message } }));
      return;
    }

    res.pipe(outStream);
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
    outStream.end(JSON.stringify({ status: 1, data: {}, statusInfo: { code: '10000', message: e.message } }));
    logger.error(e.message);
  });

  if (opt.method === 'POST') {
    req.write(JSON.stringify(postData));
  }

  req.end();
};

const getData = function getData(path, param, outStream) {
  const opt = utils.clone(options);
  opt.method = 'GET';
  opt.path = path;

  const str = [];

  if (param && !utils.isEmptyObject(param)) {
    const keys = Object.keys(param);
    for (let i = 0, len = keys.length; i < len; i++) {
      str.push(`${keys[i]}=${param[keys[i]]}`);
    }
  }

  opt.path = `${opt.path}?${str.join('&')}`;

  request(opt, param, outStream);
};

const postData = function postData(path, param, outStream) {
  const opt = utils.clone(options);
  opt.method = 'POST';
  opt.path = path;

  request(opt, param, outStream);
};

const service = {};

const TASK_CONFIG = {
  generateIndex: { stop: '/IndexTask/stop', restart: '/IndexTask/restart', list: '/IndexTask/list' },
  divideFile: { stop: '/DivideTask/stop', restart: '/DivideTask/restart', list: '/DivideTask/list' },
  transcoding: { stop: '/TranscodingChildTask/stop', restart: '/TranscodingChildTask/restart', list: '/TranscodingChildTask/list' },
  mergeFile: { stop: '/MergeTask/stop', restart: '/MergeTask/restart', list: '/MergeTask/list' },
};

service.list = function list(status, currentStep, page = 1, pageSize = 20, res) {
  const param = { page, pageSize };

  if (status) {
    param.status = status;
  }

  if (currentStep) {
    param.currentStep = currentStep;
  }

  getData('/TranscodingTask/list', param, res);
};

service.listChildTask = function listChildTask(parentId, res) {
  if (!parentId) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('childTaskParentIdIsNull') }));
  }

  getData('/TranscodingTask/listChild', { id: parentId }, res);
};

const execCommand = function execCommand(command, parentTaskId, taskId, type, res) {
  if (parentTaskId) {
    getData(`/TranscodingTask/${command}`, { taskId: parentTaskId }, res);
    return false;
  }

  if (!taskId) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('childTaskIdIsNotExist') }));
  }

  const cfg = TASK_CONFIG[type];

  if (!cfg) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('taskTypeIsNotExist') }));
  }

  getData(cfg[command], { taskId }, res);
};

service.restart = function restart(parentTaskId, taskId, type, res) {
  execCommand('restart', parentTaskId, taskId, type, res);
};

service.stop = function restart(parentTaskId, taskId, type, res) {
  execCommand('stop', parentTaskId, taskId, type, res);
};

module.exports = service;
