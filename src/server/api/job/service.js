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

const TemplateInfo = require('../template/templateInfo');

const templateService = require('../template/service');
const extService = require('./extService');

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

const downloadRequest = function downloadRequest(bucketId, transferTemplateId, transferParams, downloadParams, userId, userName, cb) {
  const p = {};

  if (bucketId) {
    p.bucketId = bucketId;
  }

  if (transferTemplateId) {
    p.templateId = transferTemplateId;
  }

  if (transferParams) {
    p.transferParams = JSON.stringify(transferParams);
  }

  if (downloadParams) {
    p.downloadParams = JSON.stringify(downloadParams);
  }

  if (userId) {
    p.userId = userId;
  }

  if (userName) {
    p.userName = userName;
  }

  const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/JobService/download`;

  utils.requestCallApi(url, 'POST', p, '', (err, rs) => {
    if (err) {
      return cb && cb(err); // res.json(result.fail(err));
    }

    return cb && cb(null, rs); // res.json(rs);
  });
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

const getTransferParams = function getTransferParams(bodyParams, cb) {
  const info = utils.merge({
    userId: '',
    receiverId: '',
    receiverType: '',
    transferMode: 'indirect',
  }, bodyParams);

  const receiverId = info.receiverId || '';
  const receiverType = info.receiverType || '';

  if (!receiverId) {
    return cb && cb(i18n.t('joShortReceiverId'));
  }
  if (!receiverType) {
    return cb && cb(i18n.t('joShortReceiverType'));
  }

  const transferParams = {
    captcha: '',
    alias: '',
    encrypt: 0, // 加密类型，0无加密，1软加密
    receiver: '', // 接收人邮箱 chaoningx@phoenixtv.com
    TransferMode: info.transferMode,   // indirect/direct 直传非直传
    hasCaptcha: 'false',
    userName: '', // 快传帐户
    password: '',  // 快传密码
  };

  userInfo.collection.findOne({ _id: info.userId }, (err, doc) => {
    if (err) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    const mediaExpressUser = doc.mediaExpressUser || {};
    transferParams.userName = mediaExpressUser.username;
    transferParams.password = mediaExpressUser.password;

    getMediaExpressEmail({
      email: mediaExpressUser.username,
      password: mediaExpressUser.password,
    }, {
      _id: receiverId,
      type: receiverType,
    }, (err, email) => {
      if (err) {
        return cb && cb(err);
      }

      transferParams.receiver = email;

      return cb && cb(null, transferParams);
    });
  });
};

const transcodeAndTransfer = function transcodeAndTransfer(bucketId, receiverId, receiverType, transcodeTemplateId, userInfo, transferMode, downloadParams, cb) {
  // 获取传输参数
  getTransferParams({
    userId: userInfo._id,
    receiverId,
    receiverType,
    TransferMode: transferMode,
  }, (err, transferParams) => {
    if (err) {
      return cb && cb(result.fail(err));
    }

    // 调用下载接口
    downloadRequest(bucketId, transcodeTemplateId, transferParams, downloadParams, userInfo._id, userInfo.name, (err, r) => {
      if (err) {
        return cb && cb(result.fail(err));
      }

      return cb && cb(null, r);
    });
  });
  return false;
};

service.listTemplate = extService.listTemplate;

service.download = function download(userInfo, downloadParams, receiverId, receiverType, transferMode = 'indirect', res) {
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

  const downloadTemplateId = downloadParams.templateId;

  // 拿到下载路径
  templateService.getDownloadPath(userInfo, downloadTemplateId, (err, rs) => {
    if (err) {
      return res.json(result.fail(err));
    }

    params.destination = rs.downloadPath;

    // 需要进行使用转码模板
    if (rs.templateInfo && rs.templateInfo.transcodeTemplateDetail && rs.templateInfo.transcodeTemplateDetail.transcodeTemplates &&
      rs.templateInfo.transcodeTemplateDetail.transcodeTemplates.length > 0 && rs.templateInfo.transcodeTemplateDetail.transcodeTemplateSelector) {
      // 获取符合条件的转码模板ID
      templateService.getTranscodeTemplate(downloadTemplateId, params.filename, (err, transcodeTemplateId) => {
        if (err) {
          return res.json(result.fail(err));
        }

        // 需要使用快传进行传输
        if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
          transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, transcodeTemplateId, userInfo, transferMode, params, (err, r) => {
            if (err) {
              return res.json(result.fail(err));
            }

            return res.json(r);
          });

          return false;
        }

        // 调用下载接口
        downloadRequest(rs.templateInfo.details.bucketId, transcodeTemplateId, '', params, userInfo._id, userInfo.name, (err, r) => {
          if (err) {
            return res.json(result.fail(err));
          }

          return res.json(r);
        });
      });

      return false;
    }

    // 需要使用快传进行传转
    if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
      transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, '', userInfo, transferMode, params, (err, r) => {
        if (err) {
          return res.json(result.fail(err));
        }

        return res.json(r);
      });

      return false;
    }

    // 调用下载接口
    downloadRequest(rs.templateInfo.details.bucketId, '', '', params, userInfo._id, userInfo.name, (err, r) => {
      if (err) {
        return res.json(result.fail(err));
      }

      return res.json(r);
    });

    return false;
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
      return cb && cb(JSON.stringify(result.fail(err)));
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

module.exports = service;
