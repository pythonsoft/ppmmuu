const request = require('request');
const config = require('../../config');
const i18n = require('i18next');
const utils = require('../../common/utils');

const workflow = {
  editImportShelve: '33c62d82-6ac1-4458-b665-f3c4b00b1278',  // 快编，入库，上架
  download: '0dfa68fa-2f25-4d8c-a466-bc7c24b3b0d6',          // 下载
  shelve: 'c73241d2-2c96-4cb1-a687-ad5db00573e9',            // 直接上架
  import: 'd5d48b0b-ea1b-4a4d-baf7-0001f3a08b41',            // 入库
};

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

service.instanceList = (page = 1, pageSize = 20, status, userId, workflowKey, cb) => {
  let workflowId = '';
  if (workflowKey && workflow[workflowKey]) {
    workflowId = workflow[workflowKey];
  }
  let params = `/instance/list?page=${page}&pageSize=${pageSize}`;

  if (status) {
    params += ('&status=' + status);
  }

  if (workflowId) {
    params += ('&workflowId=' + workflowId);
  }

  if (userId) {
    params += ('&userId=' + userId);
  }

  console.log(params);

  request(composeURL(params), (err, res, body) => {
    co(err, res, body, cb);
  });
};

service.instanceLogList = (workflowInstanceId, cb) => {
  if (!workflowInstanceId) {
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
