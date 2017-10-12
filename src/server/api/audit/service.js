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

const service = {};

/**
 * 创建审核任务
 * @param info
 * @param applicant  _id: '', name: '', companyId: '', companyName: '', departmentName: '', departmentId: ''
 * @param cb
 * @returns {*}
 */
service.create = function create(info, applicant, type=AuditInfo.TYPE.DOWNLOAD, cb) {
  const doc = utils.merge({
    name: '',
    description: '',
    detail: '',
    applicant: applicant,
  }, info);

  if(!doc.name) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'name' }));
  }

  if(!applicant) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'applicant申请人' }));
  }

  if(!applicant.name || !applicant._id) {
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

service.list = function list(keyword, applicantId, verifierId, type, status, page, pageSize, sortFields, fieldsNeed, cb) {
  const q = {};

  if (keyword) {
    q.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { 'applicant.name': { $regex: keyword, $options: 'i' } },
      { 'verifier.name': { $regex: keyword, $options: 'i' } },
    ];
  }

  if(applicantId) {
    q['applicant_id'] = applicantId;
  }

  if(verifierId) {
    q['verifier._id'] = verifierId;
  }

  if(type) {
    q['type'] = type;
  }

  if(status) {
    if(status.indexOf(',')) {
      q['status'] = { '$in': utils.formatValueNeedSplitWidthFlag(status, ',', true) };
    }else {
      q['status'] = status;
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
service.passOrReject = function passOrReject(isPass, ids, verifier, message='', cb) {
  if(!ids) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'ids' }));
  }

  if(!verifier) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'verifier审核人' }));
  }

  const verifierInfo = auditInfo.createApplicatOrVerifier(verifier);

  if(!verifierInfo.name || !verifierInfo._id) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'verifier审核人部分信息' }));
  }

  const q = {
    status: AuditInfo.STATUS.WAITING
  };

  let actionName = '';

  if (ids.replace().indexOf(',')) {
    q['_id'] = { '$in': utils.formatValueNeedSplitWidthFlag(ids, ',', true) };
    actionName = 'updateMany';
  }else {
    q['_id'] = ids;
    actionName = 'updateOne';
  }

  const updateInfo = {
    verifier: verifierInfo,
    message: message,
    status: isPass ? AuditInfo.STATUS.PASS : AuditInfo.STATUS.REJECT,
  };

  auditInfo.collection[actionName](q, updateInfo, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

  return false;
};

service.remove = function remove(ids, cb) {
  if(!ids) {
    return cb && cb(i18n.t('auditFieldIsNotExist', { field: 'ids' }));
  }

  const q = {};
  let actionName = '';

  if (ids.replace().indexOf(',')) {
    q['_id'] = { '$in': utils.formatValueNeedSplitWidthFlag(ids, ',', true) };
    actionName = 'removeMany';
  }else {
    q['_id'] = ids;
    actionName = 'removeOne';
  }

  auditInfo.collection[actionName](q, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });

  return false;
};

service.getAuditInfo = function (id, cb) {
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

module.exports = service;
