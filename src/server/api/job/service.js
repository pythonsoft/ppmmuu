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
const ShelfTaskInfo = require('../shelves/shelfTaskInfo');
const CatalogInfo = require('../library/catalogInfo');

const userInfo = new UserInfo();
const auditRuleInfo = new AuditRuleInfo();
const auditInfo = new AuditInfo();

const TemplateInfo = require('../template/templateInfo');

const templateService = require('../template/service');
const extService = require('./extService');
const mediaService = require('../media/service');
const shelvesService = require('../shelves/service');
const subscribeManagementService = require('../subscribeManagement/service');
const groupService = require('../group/service');

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

const downloadRequest = function downloadRequest(bucketId, transferTemplateId = '', transferParams, downloadParams, userId, userName, subtitleParams, cb) {
  const p = {
    source: CatalogInfo.FROM_WHERE.HK,
    fileId: '',
  };

  const pArr = [];

  if (bucketId) {
    p.bucketId = bucketId;
  }

  if (transferParams) {
    p.transferParams = JSON.stringify(transferParams);
  }

  if (downloadParams) {
    p.downloadParams = JSON.stringify(downloadParams);
  }

  if (downloadParams && downloadParams.source) {
    p.source = downloadParams.source;
    p.fileId = downloadParams.fileId || '';
  }

  if (userId) {
    p.userId = userId;
  }

  if (userName) {
    p.userName = userName;
  }

  if (subtitleParams) {
    p.subtitleParams = JSON.stringify(subtitleParams);
  }

  if (transferTemplateId) {
    if (transferTemplateId.constructor.name.toLowerCase() === 'array') {
      for (let i = 0, len = transferTemplateId.length; i < len; i++) {
        const item = JSON.parse(JSON.stringify(p));
        item.templateId = transferTemplateId[i];
        pArr.push(item);
      }
    } else {
      p.templateId = transferTemplateId;
      pArr.push(p);
    }
  } else {
    pArr.push(p);
  }

  const loopCreateDownloadRequest = function loopCreateDownloadRequest(index) {
    if (index >= pArr.length) {
      return cb && cb(null, 'ok');
    }
    const param = pArr[index];
    const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/JobService/download`;
    utils.requestCallApi(url, 'POST', param, '', (err, rs) => {
      if (err) {
        return cb && cb(err); // res.json(result.fail(err));
      }

      if (rs.status === '0') {
        loopCreateDownloadRequest(index + 1);
      } else {
        return cb && cb(i18n.t('joDownloadError', { error: rs.statusInfo.message }));
      }
    });
  };

  loopCreateDownloadRequest(0);
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

const transcodeAndTransfer = function transcodeAndTransfer(bucketId, receiverId, receiverType, transcodeTemplateId, userInfo, transferMode, downloadParams, subtitleParams, cb) {
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
    downloadRequest(bucketId, transcodeTemplateId, transferParams, downloadParams, userInfo._id, userInfo.name, subtitleParams, (err, r) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, r);
    });
  });
};

service.listTemplate = extService.listTemplate;

service.jugeTemplateAuditAndCreateAudit = function jugeTemplateAuditAndCreateAudit(info, cb) {
  if (utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('jobDownloadParamsIsNull'));
  }

  mediaService.getObject({ objectid: info.objectid }, (err, rs, fromWhere = 'mam') => {
    if (err) {
      return cb && cb(err);
    }
    // fromWhere说明是哪里来的数据，如果是mam的那么所属部门的字段为detail里边的FIELD314

    if (rs.status !== '0') {
      return cb && cb(rs.result);
    }

    let ownerName = '';

    if (fromWhere === 'mam') {
      if (rs.result && rs.result.detail && rs.result.detail.program && rs.result.detail.program.FIELD314 && rs.result.detail.program.FIELD314.value) {
        ownerName = rs.result.detail.program.FIELD314.value;
      }
    }

    if (!ownerName) {
      return cb && cb(null, true);
    }

    const userInfo = info.userInfo;
    const id = info.templateId || '';
    info.ownerName = ownerName;

    templateService.getDetail(id, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      if (!doc) {
        return cb && cb(i18n.t('templateIsNotExist'));
      }

      if (!doc.details || !doc.details.bucketId) {
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
  });
};

service.jugeDownload = function jugeDownload(info, cb) {
  service.jugeTemplateAuditAndCreateAudit(info, (err, needDownload) => {
    if (err) {
      return cb && cb(err);
    }
    if (!needDownload) {
      return cb && cb(null, 'audit');
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
  let source = info.fromWhere || CatalogInfo.FROM_WHERE.HK;
  source *= 1;
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
    templateId,
    destination: '', // 相对路径，windows路径 格式 \\2017\\09\\15
    targetname: '', // 文件名,不需要文件名后缀，非必须
    source,  // 来源
    fileId: '',      //如果来源是ump,需要文件Id
  }, downloadParams);

  if (!params.objectid && source !== CatalogInfo.FROM_WHERE.UMP) {
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

  if (!params.filetypeid && source !== CatalogInfo.FROM_WHERE.UMP) {
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
    const subtitleType = rs.templateInfo.subtitleType;
    let subtitleParams = '';

    // 需要进行使用转码模板
    if (rs.templateInfo && rs.templateInfo.transcodeTemplateDetail && rs.templateInfo.transcodeTemplateDetail.transcodeTemplates &&
      rs.templateInfo.transcodeTemplateDetail.transcodeTemplates.length > 0 && rs.templateInfo.transcodeTemplateDetail.transcodeTemplateSelector) {
      // 获取符合条件的转码模板ID
      templateService.getTranscodeTemplate(downloadTemplateId, params.filename, (err, transcodeTemplateId) => {
        if (err) {
          return cb && cb(err);
        }

        // 只有需要转码的才需要传字幕合成方式参数
        if (subtitleType && subtitleType.length > 0 && transcodeTemplateId) {
          subtitleParams = {};
          subtitleParams.subtitleTypes = subtitleType;
        }

        // 需要使用快传进行传输
        if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
          transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, transcodeTemplateId, userInfo, transferMode, params, subtitleParams, (err) => {
            if (err) {
              return cb && cb(err);
            }

            return cb && cb(null, 'ok');
          });
          return false;
        }
          // 调用下载接口
        downloadRequest(rs.templateInfo.details.bucketId, transcodeTemplateId, '', params, userInfo._id, userInfo.name, subtitleParams, (err) => {
          if (err) {
            return cb && cb(err);
          }
          return cb && cb(null, 'ok');
        });
        return false;
      });
      return false;
    }

    // 需要使用快传进行传转
    if (rs.templateInfo.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS && receiverId && receiverType) {
      transcodeAndTransfer(rs.templateInfo.details.bucketId, receiverId, receiverType, '', userInfo, transferMode, params, subtitleParams, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
      return false;
    }
      // 调用下载接口
    downloadRequest(rs.templateInfo.details.bucketId, '', '', params, userInfo._id, userInfo.name, subtitleParams, (err) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, 'ok');
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

  if (listParams.processType) {
    params.processType = listParams.processType;
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
      return cb && cb(JSON.stringify(rs));
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


// 构造快传传输参数
const getMultiTransferParams = function getMultiTransferParams(username, password, mediaExpressUser, cb) {
  const transferParams = {
    captcha: '',
    alias: '',
    encrypt: 0, // 加密类型，0无加密，1软加密
    receiver: '', // 接收人邮箱 chaoningx@phoenixtv.com
    TransferMode: 'direct',   // direct/direct 直传非直传
    hasCaptcha: 'false',
    userName: username, // 快传帐户
    password,  // 快传密码
  };

  groupService.getMediaExpressUserInfo(mediaExpressUser, (err, mediaExpressUser) => {
    if (err) {
      return cb && cb(err);
    }

    transferParams.receiver = mediaExpressUser.email;

    return cb && cb(null, transferParams);
  });
};

const loopGetTransferParams = function loopGetTransferParams(groups, username, password, index, rs, cb) {
  if (index >= groups.length) {
    return cb && cb(null);
  }

  if (!groups[index].mediaExpressUser || !groups[index].mediaExpressUser.username) {
    loopGetTransferParams(groups, username, password, index + 1, rs, cb);
  } else {
    getMultiTransferParams(username, password, groups[index].mediaExpressUser, (err, transferParams) => {
      if (err) {
        logger.error(err.message);
        loopGetTransferParams(groups, username, password, index + 1, rs, cb);
      } else {
        rs[groups[index]._id] = transferParams;
        loopGetTransferParams(groups, username, password, index + 1, rs, cb);
      }
    });
  }
};

const loopGetTranscodeTemplateId = function loopGetTranscodeTemplateId(groupIds, groupTemplateMap, filename, index, rs, cb) {
  if (index >= groupIds.length) {
    return cb && cb(null);
  }
  const groupId = groupIds[index];
  const transcodeTemplateDetail = groupTemplateMap[groupId];
  templateService.getTranscodeTemplateByDetail({ transcodeTemplateDetail }, filename, (err, transcodeTemplateId) => {
    if (err) {
      logger.error(err.messsage);
      rs[groupId] = '';
      loopGetTranscodeTemplateId(groupIds, groupTemplateMap, filename, index + 1, rs, cb);
    } else {
      rs[groupId] = transcodeTemplateId;
      loopGetTranscodeTemplateId(groupIds, groupTemplateMap, filename, index + 1, rs, cb);
    }
  });
};

// 获取得需要分发的用户列表以及快传的设置
service.mediaExpressDispatch = function mediaExpressDispatch(shelfTaskId, filetypeId, cb) {
  if (!shelfTaskId) {
    return cb && cb(i18n.t('jobMediaExpressDispatchFieldIsNull', { field: 'shelfTaskId' }));
  }

  if (!filetypeId) {
    return cb && cb(i18n.t('jobMediaExpressDispatchFieldIsNull', { field: 'filetypeId' }));
  }

  const rs = {
    templateList: [],
    transferParamMap: {
      transfer: [],
    },
  };

  shelvesService.getShelfTaskSubscribeType(shelfTaskId, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    const subscribeType = doc.editorInfo.subscribeType;
    const query = { subscribeType, autoPush: true };
    const files = doc.files;
    let filename = '';
    for (let i = 0, len = files.length; i < len; i++) {
      if (filetypeId === files[i].FILETYPEID) {
        if (files[i].FILETYPE !== ShelfTaskInfo.FILE_TYPE.LOW_CODE_VIDEO && files[i].FILETYPE !== ShelfTaskInfo.FILE_TYPE.HIGH_VIDEO) {
          return cb && cb(i18n.t('jobMediaExpressDispatchFileCannotDownload'));
        }
        filename = files[i].NAME;
        break;
      }
    }

    // 拿到所有的订阅用户ID
    subscribeManagementService.getAllSubscribeInfoByQuery(query, '_id,transcodeTemplateDetail', null, (err, subscribesInfo) => {
      if (err) {
        return cb && cb(err);
      }

      // 拿到订阅用户的传输配置
      const groupIds = [];
      const groupTemplateMap = {};
      const groupTemplateIdMap = {};
      if (!subscribesInfo || subscribesInfo.length === 0) {
        return cb && cb(i18n.t('jobMediaExpressDispatchIsNull'));
      }
      subscribesInfo.forEach((item) => {
        groupIds.push(item._id);
        groupTemplateMap[item._id] = item.transcodeTemplateDetail;
      });

      loopGetTranscodeTemplateId(groupIds, groupTemplateMap, filename, 0, groupTemplateIdMap, (err) => {
        if (err) {
          return cb && cb(err);
        }
        // 找到凤凰卫视的管理员账号配置的快传用户名和密码
        userInfo.collection.findOne({ name: config.phoenixAdminUserName }, (err, doc) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }
          if (!doc) {
            return cb && cb(i18n.t('phoenixAdminUserNotFind'));
          }

          const mediaExpressUser = doc.mediaExpressUser || '';
          if (!mediaExpressUser || !mediaExpressUser.username) {
            return cb && cb(i18n.t('phoenixAdminUserNotConfigMediaExpress'));
          }
          const username = mediaExpressUser.username;
          const password = mediaExpressUser.password;

          groupService.getGroupInfoByQuery({
            _id: { $in: groupIds },
            'mediaExpressUser.username': { $ne: '' },
          }, '_id,mediaExpressUser', '', (err, docs) => {
            if (err) {
              return cb && cb(err);
            }

            if (!docs || docs.length === 0) {
              return cb && cb(i18n.t('jobMediaExpressDispatchIsNull'));
            }

            const transferParams = {};
            loopGetTransferParams(docs, username, password, 0, transferParams, (err) => {
              if (err) {
                return cb && cb(err);
              }
              for (const key in groupTemplateIdMap) {
                if (groupTemplateIdMap[key] && transferParams[key]) {
                  if (rs.transferParamMap.prototype.hasOwnProperty(groupTemplateIdMap[key])) {
                    rs.transferParamMap[groupTemplateIdMap[key]].push(transferParams[key]);
                  } else {
                    rs.templateList.push(groupTemplateIdMap[key]);
                    rs.transferParamMap[groupTemplateIdMap[key]] = [];
                    rs.transferParamMap[groupTemplateIdMap[key]].push(transferParams[key]);
                  }
                } else if (transferParams[key]) {
                  rs.transferParamMap.transfer.push(transferParams[key]);
                }
              }
              if (rs.transferParamMap.transfer.length === 0 && rs.templateList.length === 0) {
                return cb && cb(i18n.t('jobMediaExpressDispatchIsNull'));
              }
              if (rs.transferParamMap.transfer.length === 0) {
                delete rs.transferParamMap.transfer;
              }
              if (rs.templateList.length === 0) {
                delete rs.templateList;
              }
              return cb && cb(null, rs);
            });
          });
        });
      });
    });
  });
};

module.exports = service;
