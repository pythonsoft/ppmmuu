/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const uuid = require('uuid');
const i18n = require('i18next');

const CatalogTaskInfo = require('./catalogTaskInfo');

const catalogTaskInfo = new CatalogTaskInfo();

const CatalogInfo = require('./catalogInfo');

const catalogInfo = new CatalogInfo();

const FileInfo = require('./fileInfo');

const fileInfo = new FileInfo();

const userService = require('../user/service');

const service = {};

/* catalog task */

//列出编目任务
service.listCatalogTask = function listCatalogTask(status, ownerId, assigneeId, objectId, sortFields = '-createdTime', fieldsNeed, page=1, pageSize = 20, cb) {
  const query = { };

  if (status) {
    if (status.indexOf(',') !== -1) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  }

  if(ownerId) {
    query['owner._id'] = ownerId;
  }

  if(assigneeId) {
    query['assignee._id'] = assigneeId;
  }

  if(objectId) {
    query.objectId = objectId;
  }

  catalogTaskInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);

  }, sortFields, fieldsNeed);
};

//创建编目任务
service.createCatalogTask = function createCatalogTask(info, cb) {
  if(!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCatalogTaskInfoIsNull'));
  }

  if(!info._id) {
    info._id = uuid.v1();
  }

  catalogTaskInfo.insertOne(info, (err, r) => {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);

  });
};

//更新任务信息
service.updateCatalogTask = function updateCatalogTask(taskId, info, cb) {
  if(!taskId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if(!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCatalogTaskInfoIsNull'));
  }

  if(info._id) {
    delete info._id;
  }

  const q = {
    _id: taskId.trim()
  };

  if(!info.lastModifyTime) {
    info.lastModifyTime = new Date();
  }

  catalogTaskInfo.updateOne(q, info, (err, r) => {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

//删除任务
service.deleteCatalogTask = function deleteCatalogTask(taskIds, cb) {
  if(!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  const query = {};
  let actionName = 'updateOne';

  if (taskIds.indexOf(',') !== -1) {
    query._id = { $in: taskIds.split(',') };
    actionName = 'updateMany';
  } else {
    query._id = taskIds;
  }

  catalogTaskInfo[actionName](query, {
    status: CatalogTaskInfo.STATUS.DELETE,
    lastModifyTime: new Date()
  }, (err, r) => {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

};

//任务派发
service.assignCatalogTask = function assignCatalogTask(taskIds, ownerId, assigneeId, assigneeName, cb) {
  if(!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if(!ownerId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  const query = {};
  let actionName = 'updateOne';

  if (taskIds.indexOf(',') !== -1) {
    query._id = { $in: taskIds.split(',') };
    actionName = 'updateMany';
  } else {
    query._id = taskIds;
  }

  query.status = CatalogTaskInfo.STATUS.PREPARE;

  userService.getUserDetail(ownerId, (err, doc) => {
    if(err) {
      return cb && cb(err);
    }

    catalogTaskInfo[actionName](query, {
      owner: { _id: ownerId, name: doc.name },
      assignee: { _id: assigneeId, name: assigneeName },
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.DOING,
    }, (err, r) => {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });

  });
};

//任务认领
service.applyCatalogTask = function applyCatalogTask(taskIds, ownerId, ownerName, cb) {
  if(!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if(!ownerId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if(!ownerName) {
    ownerName = ownerId;
  }

  const query = {};
  let actionName = 'updateOne';

  if (taskIds.indexOf(',') !== -1) {
    query._id = { $in: taskIds.split(',') };
    actionName = 'updateMany';
  } else {
    query._id = taskIds;
  }

  query.status = CatalogTaskInfo.STATUS.PREPARE;

  catalogTaskInfo[actionName](query, {
    owner: { _id: ownerId, name: ownerName },
    lastModifyTime: new Date(),
    status: CatalogTaskInfo.STATUS.DOING
  }, (err, r) => {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

};

//退回操作
service.sendBackCatalogTask = function sendBackCatalogTask(taskIds, sendBackerId, sendBackerName, cb) {
  if(!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  const query = {};
  let actionName = 'updateOne';

  if (taskIds.indexOf(',') !== -1) {
    query._id = { $in: taskIds.split(',') };
    actionName = 'updateMany';
  } else {
    query._id = taskIds;
  }

  //只有在编目中这状态下的才可以退回
  query.status = CatalogTaskInfo.STATUS.DOING;

  catalogTaskInfo[actionName](query, {
    lastModifyTime: new Date(),
    status: CatalogTaskInfo.STATUS.PREPARE,
    lastSendBacker: { _id: sendBackerId, name: sendBackerName },
  }, (err, r) => {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });

};

/* catalog task */

/* catalog info */

service.createCatalog = function createCatalog(info, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoIsNull'));
  }

  if(!info.objectId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'objectId' }));
  }

  if(!info.fileId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'fileId' }));
  }

  if (!info._id) {
    info._id = uuid.v1();
  }


};

/* catalog info */

module.exports = service;
