/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const config = require('../../config');
const i18n = require('i18next');

const HttpRequest = require('../../common/httpRequest');

const request = new HttpRequest({
  hostname: config.TRANSCODE_API_SERVER.hostname,
  port: config.TRANSCODE_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
});

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

  request.get('/TranscodingTask/list', param, res);
};

service.listChildTask = function listChildTask(parentId, res) {
  if (!parentId) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('childTaskParentIdIsNull') }));
  }

  request.get('/TranscodingTask/listChild', { id: parentId }, res);
};

const execCommand = function execCommand(command, parentTaskId, taskId, type, res) {
  if (parentTaskId) {
    request.get(`/TranscodingTask/${command}`, { taskId: parentTaskId }, res);
    return false;
  }

  if (!taskId) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('childTaskIdIsNotExist') }));
  }

  const cfg = TASK_CONFIG[type];

  if (!cfg) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t('taskTypeIsNotExist') }));
  }

  request.get(cfg[command], { taskId }, res);
};

service.restart = function restart(parentTaskId, taskId, type, res) {
  execCommand('restart', parentTaskId, taskId, type, res);
};

service.stop = function restart(parentTaskId, taskId, type, res) {
  execCommand('stop', parentTaskId, taskId, type, res);
};

module.exports = service;
