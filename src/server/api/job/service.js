/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const i18n = require('i18next');
const result = require('../../common/result');
const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const templateService = require('../template/service');

const TRANSCODE_API_SERVER_URL = `http://${config.TRANSCODE_API_SERVER.hostname}:${config.TRANSCODE_API_SERVER.port}`;
const HttpRequest = require('../../common/httpRequest');

const request = new HttpRequest({
  hostname: config.JOB_API_SERVER.hostname,
  port: config.JOB_API_SERVER.port,
  headers: {
    'Transfer-Encoding': 'chunked',
  },
});

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

service.download = function download(userInfo, downloadParams, res) {
  if (!downloadParams) {
    return res.end(errorCall('joDownloadParamsIsNull'));
  }

  const params = utils.merge({
    objectid: '',
    inpoint: 0, // 起始帧
    outpoint: 0, // 结束帧
    filename: '',
    filetypeid: '',
    destination: '', // 相对路径，windows路径 格式 \\2017\\09\\15
    targetname: '', // 文件名,不需要文件名后缀，非必须
  }, downloadParams);

  if (!params.objectid) {
    return res.end(errorCall('joDownloadParamsObjectIdIsNull'));
  }

  if (typeof params.inpoint !== 'number' || typeof params.outpoint !== 'number') {
    return res.end(errorCall('joDownloadParamsInpointOrOutpointTypeError'));
  }

  params.inpoint |= 1;
  params.outpoint |= 1;

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

  templateService.getTranscodeTemplate(templateId, (err, r) => {
    console.log(`err: ${err}, r: ${JSON.stringify(r)}`);
  });

  templateService.getDownloadPath(userInfo, templateId, (err, downloadPath) => {
    if (err) {
      return res.end(JSON.stringify(result.fail(err)));
    }

    params.destination = downloadPath;

    const p = {
      downloadParams: JSON.stringify(params),
      userId: userInfo._id,
      userName: userInfo.name,
    };
    const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/JobService/download`;
    utils.requestCallApi(url, 'POST', p, '', (err, rs) => {
      if (err) {
        return res.json(result.fail(err));
      }

      return res.json(rs);
    });
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

  const url = `${TRANSCODE_API_SERVER_URL}/TemplateService/create`;
  params.template = JSON.stringify(params.template);
  utils.requestCallApi(url, 'POST', params, '', (err, rs) => {
    if (err) {
      return res.json(result.fail(err));
    }

    return res.json(rs);
  });
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

  const url = `${TRANSCODE_API_SERVER_URL}/TemplateService/update`;
  params.template = JSON.stringify(params.template);
  utils.requestCallApi(url, 'POST', params, '', (err, rs) => {
    if (err) {
      return res.json(result.fail(err));
    }

    return res.json(rs);
  });
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
    if (listParams.status.indexOf(',') !== -1) {
      params.status = { $in: listParams.status.split(',') };
    } else {
      params.status = listParams.status;
    }
  }

  if (listParams.currentStep) {
    params.currentStep = listParams.currentStep;
  }

  if (listParams.userId) {
    params.userId = listParams.userId;
  }

  request.get('/JobService/list', params, res);
};

service.query = function query(queryParams, res) {
  if (!queryParams) {
    return res.end(errorCall('jobQueryParamsIsNull'));
  }

  if (!queryParams.jobId) {
    return res.end(errorCall('jobQueryParamsIdIsNull'));
  }

  const params = utils.merge({
    jobId: '',
  }, queryParams);

  request.get('/JobService/query', params, res);
};

const checkOwner = function checkOwner(jobId, userId, cb) {
  request.get('/JobService/query', { jobId }, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }

    if (rs.status !== '0') {
      return cb && cb(rs);
    }

    if (rs.data.userId !== userId) {
      return cb(errorCall('joDownloadPermissionDeny'));
    }

    return cb && cb(null, 'yes');
  });
};

service.restart = function restart(restartParams, res) {
  if (!restartParams) {
    return res.end(errorCall('jobRestartParamsIsNull'));
  }

  if (!restartParams.jobId) {
    return res.end(errorCall('jobRestartParamsIdIsNull'));
  }

  const params = utils.merge({
    jobId: '',
  }, restartParams);

  // 如果传入userId, 则检查任务的userId与之是否相等，相等则有权限操作
  if (restartParams.userId) {
    checkOwner(restartParams.jobId, restartParams.userId, (err) => {
      if (err) {
        return res.end(err);
      }

      request.get('/JobService/restart', params, res);
    });
  } else {
    request.get('/JobService/restart', params, res);
  }
};

service.stop = function stop(stopParams, res) {
  if (!stopParams) {
    return res.end(errorCall('jobStopParamsIsNull'));
  }

  if (!stopParams.jobId) {
    return res.end(errorCall('jobStopParamsIdIsNull'));
  }

  const params = utils.merge({
    jobId: '',
  }, stopParams);

  // 如果传入userId, 则检查任务的userId与之是否相等，相等则有权限操作
  if (stopParams.userId) {
    checkOwner(stopParams.jobId, stopParams.userId, (err) => {
      if (err) {
        return res.end(err);
      }

      request.get('/JobService/stop', params, res);
    });
  } else {
    request.get('/JobService/stop', params, res);
  }
};

service.delete = function del(deleteParams, res) {
  if (!deleteParams) {
    return res.end(errorCall('jobDeleteParamsIsNull'));
  }

  if (!deleteParams.jobId) {
    return res.end(errorCall('jobDeleteParamsIdIsNull'));
  }

  const params = utils.merge({
    jobId: '',
  }, deleteParams);

  // 如果传入userId, 则检查任务的userId与之是否相等，相等则有权限操作
  if (deleteParams.userId) {
    checkOwner(deleteParams.jobId, deleteParams.userId, (err) => {
      if (err) {
        return res.end(err);
      }

      request.get('/JobService/stop', params, res);
    });
  } else {
    request.get('/JobService/delete', params, res);
  }
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
  requestTemplate.get('/TemplateService/delete', params, res);
};

const getMediaExpressEmail = function getMediaExpressEmail(loginForm, receiver, cb) {
  let url = `${config.mediaExpressUrl}login`;
  utils.requestCallApiGetCookie(url, 'POST', loginForm, '', (err, cookie) => {
    if (err) {
      return cb && cb(err);
    }
    if (!cookie) {
      return cb && cb(i18n.t('bindMediaExpressUserNeedRefresh'));
    }

    url = `${config.mediaExpressUrl}directAuthorize/getEmail?t=${new Date().getTime()}`;
    utils.requestCallApi(url, 'GET', receiver, cookie, (err, rs) => {
      if (err) {
        return cb && cb(err);
      }
      if (rs.status !== 0) {
        return cb && cb(i18n.t('requestCallApiError', { error: rs.result }));
      }

      return cb && cb(null, rs.result);
    });
  });
};

service.downloadAndTransfer = function downloadAndTransfer(req, cb) {
  const info = req.body;
  const userId = req.ex.userId;
  const userName = req.ex.userInfo.name;
  const downloadParams = info.downloadParams || '';
  const receiverId = info.receiverId || '';
  const receiverType = info.receiverType || '';
  const templateId = info.templateId || '';

  if (!downloadParams) {
    return cb && cb(i18n.t('joShortDownloadParams'));
  }
  if (!receiverId) {
    return cb && cb(i18n.t('joShortReceiverId'));
  }
  if (!receiverType) {
    return cb && cb(i18n.t('joShortReceiverType'));
  }
  if (!templateId) {
    return cb && cb(i18n.t('joShortTemplateId'));
  }

  const params = {
    downloadParams,
    transferParams: {
      captcha: '',
      alias: '',
      encrypt: 0,
      receiver: '',
      TransferMode: 'direct',
      hasCaptcha: 'false',
      userName: '',
      password: '',
    },
    userId,
    userName,
  };

  userInfo.collection.findOne({ _id: userId }, (err, doc) => {
    if (err) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    const mediaExpressUser = doc.mediaExpressUser || {};
    params.transferParams.userName = mediaExpressUser.username;
    params.transferParams.password = mediaExpressUser.password;

    const loginForm = {
      email: mediaExpressUser.username,
      password: mediaExpressUser.password,
    };

    const receiver = {
      _id: receiverId,
      type: receiverType,
    };
    templateService.getDownloadPath(doc, templateId, (err, downloadPath) => {
      if (err) {
        return cb && cb(err);
      }

      params.downloadParams.destination = downloadPath;
      getMediaExpressEmail(loginForm, receiver, (err, email) => {
        if (err) {
          return cb && cb(err);
        }

        params.transferParams.receiver = email;
        params.transferParams = JSON.stringify(params.transferParams);
        params.downloadParams = JSON.stringify(params.downloadParams);
        console.log(JSON.stringify(params));

        const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/JobService/downloadAndTransfer`;
        utils.requestCallApi(url, 'POST', params, '', (err, rs) => {
          if (err) {
            return cb && cb(err);
          }

          if (rs.status === '0') {
            return cb && cb(null, 'ok');
          }
          return cb && cb(i18n.t('requestCallApiError', { error: rs.statusInfo.message }));
        });
      });
    });
  });
};

module.exports = service;
