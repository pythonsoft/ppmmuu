'use strict';

const i18n = require('i18next');
const uuid = require('uuid');
const logger = require('../../common/log')('error');
const ShelfTaskInfo = require('../shelves/shelfTaskInfo');
const TemplateInfo = require('./templateInfo');
const groupService = require('../group/service');
const shelfService = require('../shelves/service');

const templateInfo = new TemplateInfo();

const service = {};

service.listShelfTask = function listShelfTask(info, cb) {
  const keyword = info.keyword || '';
  const status = info.status || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 20;
  const query = {};

  if (status) {
    if (ShelfTaskInfo.DEAL_STATUS.indexOf(status) === -1) {
      return cb && cb(i18n.t('shelfStatusNotCorrect'));
    }
    if (status.indexOf(',') !== -1) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  } else {
    query.status = { $in: ShelfTaskInfo.DEAL_STATUS };
  }

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { programNO: { $regex: keyword, $options: 'i' } },
      { 'assignee.name': { $regex: keyword, $options: 'i' } },
      { 'dealer.name': { $regex: keyword, $options: 'i' } },
    ];
  }

  shelfService.listShelfTask(query, page, pageSize, cb);
};


/* 上架模板 */
service.addTemplate = function addTemplate(info, creatorId, creatorName, cb) {
  const t = new Date();
  if (!info.departmentId) {
    return cb && cb(i18n.t('libraryTemplateInfoFieldIsNull', { field: 'departmentId' }));
  }

  info._id = uuid.v1();
  info.creator = { _id: creatorId, name: creatorName };
  info.createdTime = t;
  info.lastModifyTime = t;

  groupService.getGroup(info.departmentId, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc) {
      return cb && cb(i18n.t('libraryDepartmentInfoIsNotExist'));
    }

    info.department = { _id: doc._id, name: doc.name };
    templateInfo.insertOne(info, (err) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, info);
    });
  });
};

service.getTemplateInfo = function getTemplateInfo(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryTemplateInfoFieldIsNull', { field: '_id' }));
  }

  templateInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.listTemplate = function listCatalogTask(fieldsNeed, page = 1, pageSize = 20, cb) {
  const query = { };

  templateInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createdTime', fieldsNeed);
};

service.removeTemplate = function removeTemplate(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryTemplateInfoFieldIsNull', { field: '_id' }));
  }

  templateInfo.collection.removeOne({ _id }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateTemplate = function updateTemplate(_id, info, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryTemplateInfoFieldIsNull', { field: '_id' }));
  }

  delete info._id;

  if (info.departmentId) {
    groupService.getGroup(info.departmentId, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      if (!doc) {
        return cb && cb(i18n.t('libraryDepartmentInfoIsNotExist'));
      }

      info.department = { _id: doc._id, name: doc.name };

      templateInfo.updateOne({ _id }, info, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, info);
      });
    });
  } else {
    templateInfo.updateOne({ _id }, info, (err) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, info);
    });
  }
};
module.exports = service;
