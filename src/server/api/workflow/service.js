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

/* instance */
service.instanceCreate = (name, workflowId, parms, priority, cb) => {
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

service.instanceDetail = (id, cb) => {
  if(!id) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'id' }));
  }

  request(composeURL(`/instance/detail/${id}`), (err, res, body) => {
    co(err, res, body, cb);
  });
};

service.instanceList = (page=1, pageSize=20, status, cb) => {
  let params = `/instance/list?page=${page}&pageSize=${pageSize}`;

  if(status) {
    params += ('&&status=' + status);
  }

  request(composeURL(params), (err, res, body) => {
    co(err, res, body, cb);
  });
};

service.instanceLogList = (workflowInstanceId, cb) => {
  if(!workflowInstanceId) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'workflowInstanceId' }));
  }

  request(composeURL(`/instance_log/list?workflowInstanceId=${workflowInstanceId}`), (err, res, body) => {
    co(err, res, body, cb);
  });
};

/* 工作流定义管理 */
service.definitionList = (page, pageSize, keyword, cb) => {
  request(composeURL(`/definition/list?page=${page || 1}&pageSize=${pageSize || 20}&keyword=${keyword || ''}`), (err, res, body) => {
    co(err, res, body, cb);
  });
};

service.definitionCreate = (name, definition, description, cb) => {
  if(!name) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'name' }));
  }

  if(!definition) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'definition' }));
  }

  if(!description) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'description' }));
  }

  const postData = {
    name,
    definition,
    description,
  };

  const options = {
    method: 'POST',
    url: composeURL('/definition/create'),
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

service.definitionUpdate = (id, info, cb) => {
  if(!id) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'id' }));
  }

  const postData = {
    id
  };

  if(typeof info.name !== 'undefined') {
    postData['name'] = info.name;
  }

  if(typeof info.definition !== 'undefined') {
    postData['definition'] = info.definition;
  }

  if(typeof info.description !== 'undefined') {
    postData['description'] = info.description;
  }

  const options = {
    method: 'POST',
    url: composeURL('/definition/update'),
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

service.definitionDetail = (id, cb) => {
  if(!id) {
    return cb && cb(i18n.t('instanceParamsError', { error: 'id' }));
  }

  request(composeURL(`/definition/detail/${id}`), (err, res, body) => {
    co(err, res, body, cb);
  });
};

module.exports = service;
