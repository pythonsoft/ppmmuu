/**
 * Created by chaoningx on 2017/10/12.
 */

'use strict';

const uuid = require('uuid');

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const AuditInfo = require('./auditInfo');

const auditInfo = new AuditInfo();

const AuditRuleInfo = require('./auditRuleInfo');

const auditRuleInfo = new AuditRuleInfo();

const GroupInfo = require('../group/groupInfo');

const jobService = require('../job/service');

const service = {};

/**
 * 创建审核任务
 * @param info
 * @param applicant  _id: '', name: '', companyId: '', companyName: '', departmentName: '', departmentId: ''
 * @param cb
 * @returns {*}
 */
service.create = function create(info, applicant, type = AuditInfo.TYPE.DOWNLOAD, cb) {
  const doc = utils.merge({
    name: '',
    description: '',
    detail: '',
    applicant,
  }, info);

  if (!doc.name) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'name' }));
  }

  if (!applicant) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'applicant申请人' }));
  }

  if (!applicant.name || !applicant._id) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'applicant申请人部分信息' }));
  }

  const currentTime = new Date();

  doc._id = uuid.v1();
  doc.createTime = currentTime;
  doc.lastModify = currentTime;
  doc.status = AuditInfo.STATUS.WAITING;
  doc.type = type;

  auditInfo.insertOne(doc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.list = function list(req, cb) {
  const keyword = req.query.keyword;
  const type = req.query.type || '';
  let status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const sortFields = req.query.sortFields || '-createTime';
  const fieldsNeed = req.query.fieldsNeed || '';
  const q = {};

  status = status === '-1' ? '' : status;
  // q['ownerDepartment._id'] = userInfo.department._id;
  if (keyword) {
    q.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { 'applicant.name': { $regex: keyword, $options: 'i' } },
      { 'verifier.name': { $regex: keyword, $options: 'i' } },
    ];
  }

  if (type) {
    q.type = type;
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
  }, sortFields, fieldsNeed);

  return false;
};

/**
 *
 * @param isPass
 * @param ids
 * @param verifier _id: '', name: '', companyId: '', companyName: '', departmentName: '', departmentId: ''
 * @param message
 * @param cb
 * @returns {*}
 */
service.passOrReject = function passOrReject(req, cb) {
  const ids = req.body.ids;
  const userInfo = req.ex.userInfo;
  const message = req.body.message || '';
  const status = req.body.status || '';

  const verifier = {
    _id: userInfo._id,
    name: userInfo.name,
    companyId: userInfo.company._id,
    companyName: userInfo.company.name,
    departmentId: userInfo.department._id,
    departmentName: userInfo.department.name,
  };
  const isPass = status === AuditInfo.STATUS.PASS;

  if (!ids) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'ids' }));
  }

  if (!verifier) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'verifier审核人' }));
  }

  const verifierInfo = auditInfo.createApplicantOrVerifier(verifier);

  if (!verifierInfo.name || !verifierInfo._id) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'verifier审核人部分信息' }));
  }

  const q = {
    status: AuditInfo.STATUS.WAITING,
  };

  if (ids.replace().indexOf(',')) {
    q._id = { $in: utils.formatValueNeedSplitWidthFlag(ids, ',', true) };
  } else {
    q._id = ids;
  }

  const updateInfo = {
    verifier: verifierInfo,
    message,
    status: isPass ? AuditInfo.STATUS.PASS : AuditInfo.STATUS.REJECT,
  };


  if (isPass) {
    auditInfo.collection.find({ _id: q._id, status: AuditInfo.STATUS.WAITING }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!docs || docs.length === 0) {
        return cb && cb(i18n.t('auditInfoCannotFind'));
      }
      const successIds = [];
      const updateAuditInfo = function updateAuditInfo(successIds, cb) {
        auditInfo.collection.updateMany({ _id: { $in: successIds } }, { $set: updateInfo }, (err) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }
          return cb && cb(null, 'ok');
        });
      };
      const loopCreateDownload = function loopCreateDownload(docs, index) {
        if (index >= docs.length) {
          updateAuditInfo(successIds, cb);
        } else {
          let downloadFunc = jobService.download;
          if (docs[index].detail && docs[index].detail.isMultiDownload) {
            downloadFunc = jobService.multiDownload;
          }
          downloadFunc(docs[index].detail, (err) => {
            if (err) {
              updateAuditInfo(successIds, () => cb && cb(err));
            } else {
              successIds.push(docs[index]._id);
              loopCreateDownload(docs, index + 1);
            }
          });
        }
      };

      loopCreateDownload(docs, 0);
    });
  } else {
    auditInfo.collection.updateMany(q, { $set: updateInfo }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  }
};

service.remove = function remove(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'ids' }));
  }

  const q = {};
  let actionName = '';

  if (ids.replace().indexOf(',')) {
    q._id = { $in: utils.formatValueNeedSplitWidthFlag(ids, ',', true) };
    actionName = 'removeMany';
  } else {
    q._id = ids;
    actionName = 'removeOne';
  }

  auditInfo.collection[actionName](q, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

  return false;
};

service.getAuditInfo = function getAuditInfo(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'id' }));
  }

  auditInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('auditInfoIsNotExist'));
    }

    return cb && cb(null, doc);
  });
};

// 审核授权

const createWhitelistInfo = function createWhitelistInfo(whiteList) {
  if (whiteList === '') {
    return { err: null, doc: [] };
  }

  try {
    const infos = whiteList;

    if (infos.constructor !== Array) {
      return { err: i18n.t('auditRuleWhitelistIsInvalid'), doc: null };
    }

    const ws = [];

    for (let i = 0, len = infos.length; i < len; i++) {
      if (infos[i]._id && infos[i].name && infos[i].type && utils.isValueInObject(infos[i].type, GroupInfo.TYPE)) {
        ws.push(utils.merge({
          _id: '',
          name: '',
          type: '', // 部门，小组，可以使用帐户系统中的分类型
          exts: 'all', // 允许下载的文件类型，以后缀做区分，全部：all，除此外使用逗号分割，如: .mxf,.mp4
        }, infos[i]));
      } else {
        return { err: i18n.t('auditRuleWhitelistIsInvalid'), doc: null };
      }
    }

    return { err: null, doc: ws };
  } catch (e) {
    return { err: i18n.t('auditRuleWhitelistIsInvalid'), doc: null };
  }
};

const createAuditDepartment = function createAuditDepartment(permissionType, auditDepartment) {
  if (permissionType === AuditRuleInfo.PERMISSTION_TYPE.AUDIT) {
    if (!auditDepartment) {
      return { err: i18n.t('auditRuleFieldIsNotExist', { field: 'auditDepartment' }), doc: null };
    }

    if (!auditDepartment._id || !auditDepartment.name) {
      return { err: i18n.t('auditRuleFieldIsNotExist', { field: 'auditDepartment部分' }), doc: null };
    }

    console.log('createAuditDepartment --->', auditDepartment);

    const doc = utils.merge({
      _id: '',
      name: '',
    }, auditDepartment);

    return { err: null, doc };
  }
  return { err: null, doc: null };
};

service.createAuditRule = function createRule(info, creator, cb) {
  const doc = utils.merge({
    ownerName: '',
    permissionType: AuditRuleInfo.PERMISSTION_TYPE.PUBLIC,
    auditDepartment: '',
    whitelist: '',
    description: '',
    detail: {},
  }, info);

  if (!info.ownerName) {
    return cb && cb(i18n.t('auditRuleFieldIsNotExist', { field: 'ownerName' }));
  }

  const auditDepartmentRs = createAuditDepartment(doc.permissionType, doc.auditDepartment);
  const rs = createWhitelistInfo(doc.whitelist);

  if (auditDepartmentRs.err) {
    return cb && cb(auditDepartmentRs.err);
  }

  if (rs.err) {
    return cb && cb(rs.err);
  }

  const t = new Date();

  doc.creator = creator;
  doc.auditDepartment = auditDepartmentRs.doc ? auditDepartmentRs.doc : { _id: '', name: '' };
  doc.whitelist = rs.doc;
  doc._id = uuid.v1();
  doc.createdTime = t;
  doc.modifyTime = t;

  auditRuleInfo.insertOne(doc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.listAuditRule = function listRule(creatorId, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};

  if (creatorId) {
    q['creator._id'] = creatorId;
  }

  auditRuleInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.updateAuditRule = function updateRule(info, cb) {
  const id = info._id;

  if (!id) {
    return cb && cb(i18n.t('auditRuleFieldIsNotExist', { field: '_id' }));
  }

  const doc = utils.merge({
    ownerName: '',
    permissionType: AuditRuleInfo.PERMISSTION_TYPE.PUBLIC,
    auditDepartment: '',
    whitelist: '',
    description: '',
    detail: {},
  }, info);

  if (!info.ownerName) {
    return cb && cb(i18n.t('auditRuleFieldIsNotExist', { field: 'ownerName' }));
  }

  const auditDepartmentRs = createAuditDepartment(doc.permissionType, doc.auditDepartment);
  const rs = createWhitelistInfo(doc.whitelist);

  if (auditDepartmentRs.err) {
    return cb && cb(auditDepartmentRs.err);
  }

  if (rs.err) {
    return cb && cb(rs.err);
  }

  doc.auditDepartment = auditDepartmentRs.doc;
  doc.whitelist = rs.doc;
  doc.modifyTime = new Date();

  console.log('update audit rule --->', doc);

  auditRuleInfo.updateOne({ _id: id }, doc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.removeAuditRule = function updateRule(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('auditRuleFieldIsNotExist', { field: 'ids' }));
  }

  const q = {};
  let actionName = '';

  if (ids.replace().indexOf(',')) {
    q._id = { $in: utils.formatValueNeedSplitWidthFlag(ids, ',', true) };
    actionName = 'removeMany';
  } else {
    q._id = ids;
    actionName = 'removeOne';
  }

  auditRuleInfo.collection[actionName](q, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

  return false;
};

module.exports = service;
