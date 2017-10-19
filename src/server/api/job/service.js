/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const result = require('../../common/result');
const UserInfo = require('../user/userInfo');
const AuditRuleInfo = require('../audit/auditRuleInfo');
const AuditInfo = require('../audit/auditInfo');

const userInfo = new UserInfo();
const auditRuleInfo = new AuditRuleInfo();
const auditInfo = new AuditInfo();

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

const downloadRequest = function downloadRequest(bucketId, transferTemplateId = '', transferParams, downloadParams, userId, userName, cb) {
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
    transferMode: 'direct',
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
    TransferMode: info.transferMode,   // direct/direct 直传非直传
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
      return cb && cb(err);
    }

    // 调用下载接口
    downloadRequest(bucketId, transcodeTemplateId, transferParams, downloadParams, userInfo._id, userInfo.name, (err, r) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, r);
    });
  });
};

service.listTemplate = extService.listTemplate;


service.jugeTemplateAuditAndCreateAudit = function jugeTemplateAuditAndCreateAudit(info, cb) {
  const ownerName = info.ownerName || '';
  const userInfo = info.userInfo;
  const id = info.templateId || '';
  if (!ownerName) {
    return cb && cb(null, true);
  }
  templateService.getDetail(id, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc) {
      return cb && cb(i18n.t('templateIsNotExist'));
    }

    if (!doc.details.bucketId) {
      return cb && cb(i18n.t('templateBucketIdIsNotExist'));
    }

    if (!doc.downloadAudit) {
      return cb && cb(null, true);
    }

    auditRuleInfo.collection.findOne({ ownerName }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null, true);
      }

      if (doc.permissionType === AuditRuleInfo.PERMISSTION_TYPE.PUBLIC) {
        return cb && cb(null, true);
      }

      const whiteList = doc.whiteList || [];
      for (let i = 0, len = whiteList.length; i < len; i++) {
        const _id = whiteList[i]._id;
        if (_id === userInfo._id || _id === userInfo.company._id || _id === userInfo.department._id) {
          return cb && cb(null, true);
        }
      }

      const insertInfo = {
        name: info.filename,
        description: '',
        detail: info,
        applicant: {
          _id: userInfo._id,
          name: userInfo.name,
          companyId: userInfo.company._id,
          companyName: userInfo.company.name,
          departmentName: userInfo.department.name,
          departmentId: userInfo.department._id,
        },
        ownerDepartment: doc.auditDepartment,
      };
      insertInfo.createTime = new Date();
      insertInfo.lastModify = new Date();
      insertInfo.status = AuditInfo.STATUS.WAITING;
      insertInfo.type = AuditInfo.TYPE.DOWNLOAD;

      auditInfo.insertOne(insertInfo, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, false);
      });
    });
  });
};

service.jugeDownload = function jugeDownload(info, cb) {
  service.jugeTemplateAuditAndCreateAudit(info, (err, needDownload) => {
    if (err) {
      return cb && cb(err);
    }
    if (!needDownload) {
      return cb && cb(null, 'ok');
    }
    service.download(info, cb);
  });
};

service.download = function download(info, cb) {
  const userInfo = info.userInfo;
  const objectid = info.objectid;
  const inpoint = info.inpoint || 0;
  const outpoint = info.outpoint;
  const filename = info.filename;
  const filetypeid = info.filetypeid;
  const templateId = info.templateId; // 下载模板Id
  const receiverId = info.receiverId;
  const receiverType = info.receiverType;
  const transferMode = info.transferMode || 'direct';
  const downloadParams = { objectid, inpoint: inpoint * 1, outpoint: outpoint * 1, filename, filetypeid, templateId };
  if (!downloadParams) {
    return cb && cb(i18n.t('joDownloadParamsIsNull'));
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
    return cb && cb(i18n.t('joDownloadParamsObjectIdIsNull'));
  }

  if (typeof params.inpoint !== 'number' || typeof params.outpoint !== 'number') {
    return cb && cb(i18n.t('joDownloadParamsInpointOrOutpointTypeError'));
  }

  if (params.inpoint > params.outpoint) {
    return cb && cb(i18n.t('joDownloadParamsInpointLessThanOutpointTypeError'));
  }

  if (!params.filename) {
    return cb && cb(i18n.t('joDownloadParamsFileNameIsNull'));
  }

  if (!params.filetypeid) {
    return cb && cb(i18n.t('joDownloadParamsFileTypeIdIsNull'));
  }

  if (!userInfo) {
    return cb && cb(i18n.t('userNotFind'));
  }

  const downloadTemplateId = downloadParams.templateId;

  // 拿到下载路径
  templateService.getDownloadPath(userInfo, downloadTemplateId, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }

    params.destination = rs.downloadPath;

    // 需要进行使用转码模板
    if (rs.templateInfo && rs.templateInfo.transcodeTemplateDetail && rs.templateInfo.transcodeTemplateDetail.transcodeTemplates &&
      rs.templateInfo.transcodeTemplateDetail.transcodeTemplates.length > 0 && rs.templateInfo.transcodeTemplateDetail.transcodeTemplateSelector) {
      // 获取符合条件的转码模板ID
      templateService.getTranscodeTemplate(downloadTemplateId, params.filename, (err, transcodeTemplateId) => {
        if (err) {
          return cb && cb(err);
        }

        // 需要使用快传进行传输
        if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
          transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, transcodeTemplateId, userInfo, transferMode, params, (err) => {
            if (err) {
              return cb && cb(err);
            }

            return cb && cb(null, 'ok');
          });
        } else {
          // 调用下载接口
          downloadRequest(rs.templateInfo.details.bucketId, transcodeTemplateId, '', params, userInfo._id, userInfo.name, (err) => {
            if (err) {
              return cb && cb(err);
            }

            return cb && cb(null, 'ok');
          });
        }
      });
    }

    // 需要使用快传进行传转
    if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
      transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, '', userInfo, transferMode, params, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
    } else {
      // 调用下载接口
      downloadRequest(rs.templateInfo.details.bucketId, '', '', params, userInfo._id, userInfo.name, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
    }
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

service.listAuditInfo = function listAuditInfo(req, isAll = false, cb) {
  const page = req.query.page || 0;
  const pageSize = req.query.pageSize || 20;
  const keyword = req.query.keyword || '';
  const status = req.query.status || '';
  const userInfo = req.ex.userInfo;
  const q = {};

  if (isAll) {
    q['ownerDepartment._id'] = userInfo.department._id;
  } else {
    q['applicant._id'] = userInfo._id;
  }

  if (keyword) {
    q.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { 'applicant.name': { $regex: keyword, $options: 'i' } },
      { 'verifier.name': { $regex: keyword, $options: 'i' } },
    ];
  }

  if (status) {
    if (status.indexOf(',')) {
      q.status = { $in: utils.formatValueNeedSplitWidthFlag(status, ',', true) };
    } else {
      q.status = status;
    }
  }

  auditInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createTime', 'name,status,createTime,lastModify,applicant,verifier');
};

module.exports = service;
