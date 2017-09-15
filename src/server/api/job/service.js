/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const i18n = require('i18next');
const result = require('../../common/result');

const templateService = require('../template/service');

const HttpRequest = require('../../common/httpRequest');

const request = new HttpRequest({
  hostname: config.JOB_API_SERVER.hostname,
  port: config.JOB_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
});

const service = {};

const errorCall = function (str) {
  return JSON.stringify({ status: 1, data: {}, statusInfo: i18n.t(str) });
};

service.download = function download(userInfo, downloadParams, res) {
  if (!downloadParams) {
    return res.end(errorCall('joDownloadParamsIsNull'));
  }

  const params = utils.merge({
    "objectid": "",
    "inpoint": 0,//起始帧
    "outpoint": 0,//结束帧
    "filename": "",
    "filetypeid": "",
    "destination": "", //相对路径，windows路径 格式 \\2017\\09\\15
    "targetname": ""//文件名,不需要文件名后缀，非必须
  }, downloadParams);

  if (!params.objectid) {
    return res.end(errorCall('joDownloadParamsObjectIdIsNull'));
  }

  if (typeof params.inpoint !== 'number' || typeof params.outpoint !== 'number') {
    return res.end(errorCall('joDownloadParamsInpointOrOutpointTypeError'));
  }

  if (params.inpoint > params.outpoint) {
    return res.end(errorCall('joDownloadParamsInpointLessThanOutpointTypeError'));
  }

  if (!params.filename) {
    return res.end(errorCall('joDownloadParamsFileNameIsNull'));
  }

  if (!params.filetypeid) {
    return res.end(errorCall('joDownloadParamsFileTypeIdIsNull'));
  }

  if (!userInfo) {
    return res.end(errorCall('userNotFind'));
  }

  const templateId = downloadParams.templateId;

  templateService.getDownloadPath(userInfo, templateId, (err, downloadPath) => {
    if(err) {
      return res.end(result.fail(err));
    }

    params.destination = downloadPath;

    const p = {
      downloadParams: params,
      userId: userInfo._id,
      userName: userInfo.name
    };

    request.post('/JobService/download', p, res);
  });
};

service.createJson = function createJson(createJsonParams, res) {
  if (!createJsonParams) {
    return res.end(errorCall('jobCreateTemplateParamsIsNull'));
  }
  const params = utils.merge({
    template: '',
  }, createJsonParams);
  if (!params.template) {
    return res.end(errorCall('jobCreateTemplateParamsCreateJsonIsNull'));
  }
  params.template = JSON.parse(params.template);
  request.post('/TemplateService/create', params, res);
};

service.updateJson = function updateJson(updateJsonParams, res) {
  if (!updateJsonParams) {
    return res.end(errorCall('jobCreateTemplateParamsIsNull'));
  }
  const params = utils.merge({
    template: '',
  }, updateJsonParams);
  if (!params.template) {
    return res.end(errorCall('jobCreateTemplateParamsCreateJsonIsNull'));
  }
  params.template = JSON.parse(params.template);
  request.post('/TemplateService/update', params, res);
};

service.list = function list(listParams, res) {
  if (!listParams) {
    return res.end(errorCall('jobListParamsIsNull'));
  }

  const params = utils.merge({
    page: 1,
    pageSize: 99,
  }, listParams);

  if (listParams.status) {
    params.status = listParams.status;
  }
  if (listParams.currentStep) {
    params.currentStep = listParams.currentStep;
  }
  request.get('/JobService/list', params, res);
};

service.listTemplate = function listTemplate(listTemplateParams, res) {
  if (!listTemplateParams) {
    return res.end(errorCall('jobListTemplateParamsIsNull'));
  }

  const params = utils.merge({
    page: 1,
    pageSize: 99,
  }, listTemplateParams);

  request.get('/TemplateService/list', params, res);
};

service.query = function query(queryParams, res) {
  if (!queryParams) {
    return res.end(errorCall('jobQueryParamsIsNull'));
  }
  const params = utils.merge({
    jobId: '',
  }, queryParams);
  if (!params.jobId) {
    return res.end(errorCall('jobQueryParamsIdIsNull'));
  }
  request.get('/JobService/query', params, res);
};

service.restart = function restart(restartParams, res) {
  if (!restartParams) {
    return res.end(errorCall('jobRestartParamsIsNull'));
  }
  const params = utils.merge({
    jobId: '',
  }, restartParams);
  if (!params.jobId) {
    return res.end(errorCall('jobRestartParamsIdIsNull'));
  }
  request.get('/JobService/restart', params, res);
};

service.stop = function stop(stopParams, res) {
  if (!stopParams) {
    return res.end(errorCall('jobStopParamsIsNull'));
  }
  const params = utils.merge({
    jobId: '',
  }, stopParams);
  if (!params.jobId) {
    return res.end(errorCall('jobStopParamsIdIsNull'));
  }
  request.get('/JobService/stop', params, res);
};

service.delete = function del(deleteParams, res) {
  if (!deleteParams) {
    return res.end(errorCall('jobDeleteParamsIsNull'));
  }
  const params = utils.merge({
    jobId: '',
  }, deleteParams);
  if (!params.jobId) {
    return res.end(errorCall('jobDeleteParamsIdIsNull'));
  }
  request.get('/JobService/delete', params, res);
};

service.deleteTemplate = function del(deleteParams, res) {
  if (!deleteParams) {
    return res.end(errorCall('jobDeleteParamsIsNull'));
  }
  const params = utils.merge({
    id: '',
  }, deleteParams);
  if (!params.id) {
    return res.end(errorCall('jobDeleteParamsIdIsNull'));
  }
  request.get('/TemplateService/delete', params, res);
};

module.exports = service;
