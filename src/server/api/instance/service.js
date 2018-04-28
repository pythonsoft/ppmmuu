const request = require('request');
const config = require('../../config');
const i18n = require('i18next');
const utils = require('../../common/utils');

const service = {};

const composeURL = (url) => {
  return `${config.instance.protocol}://${config.instance.host}:${config.instance.port}${url}`;
};

const co = (err, res, body, cb) => {
  if(err) {
    return cb && cb(typeof err === 'string' ? err : err.message);
  }

  const statusCode = res.statusCode;

  if (statusCode !== 200) {
    return cb && cb(`Request Failed. Status Code: ${statusCode}`);
  }

  try {
    let responseBody = {};

    if(typeof body === 'string') {
      responseBody = JSON.parse(body);
    }else {
      responseBody = body;
    }

    if(responseBody.status === 0 || responseBody.status === '0') {
      return cb && cb(null, responseBody.result);
    }else {
      return cb && cb(responseBody.result);
    }
  } catch (e) {
    return cb && cb(e.message);
  }
};

service.create = (name, workflowId, parms, priority, cb) => {
  if(!workflowId) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'workflowId' }));
  }

  if(!parms || utils.isEmptyObject(parms)) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'params' }));
  }

  const postData = {
    name: name || workflowId,
    workflowId,
    parms: parms,
    priority: priority || 0
  };

  const options = {
    method: 'POST',
    url: composeURL('/instance/create'),
    headers:
      { 'cache-control': 'no-cache',
        'content-type': 'application/json' },
    body: postData,
    json: true
  };

  request(options, function (err, res, body) {
    co(err, res, body, cb);
  });
};

service.detail = (id, cb) => {
  if(!id) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'id' }));
  }

  request(composeURL(`/instance/detail/${id}`), (err, res, body) => {
    co(err, body, res, cb);
  });
};

service.list = (page=1, pageSize=20, cb) => {
  request(composeURL(`/instance/list?page=${page}&pageSize=${pageSize}`), (err, res, body) => {
    co(err, body, res, cb);
  });
};

service.listLog = (workflowInstanceId, cb) => {
  if(!id) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'workflowInstanceId' }));
  }

  request(composeURL(`/instance_log/list?workflowInstanceId=${workflowInstanceId}`), (err, res, body) => {
    co(err, body, res, cb);
  });
};

module.exports = service;
