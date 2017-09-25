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

// 列出编目任务
service.listCatalogTask = function listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields = '-createdTime', fieldsNeed, page = 1, pageSize = 20, keyword, cb) {
  const query = { };

  if (status) {
    if (status.indexOf(',') !== -1) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  }

  if(keyword){
    query.name = {"$regex":keyword, "$options":"i"};
  }

  if (departmentId) {
    query['department._id'] = departmentId;
  }

  if (ownerId) {
    query['owner._id'] = ownerId;
  }

  if (assigneeId) {
    query['assignee._id'] = assigneeId;
  }

  if (objectId) {
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

// 创建编目任务
service.createCatalogTask = function createCatalogTask(info, creatorId, creatorName, departmentId, departmentName, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCatalogTaskInfoIsNull'));
  }

  if (!info.objectId) {
    return cb && cb(i18n.t('libraryCreateCatalogTaskInfoFieldIsNull', { field: 'objectId' }));
  }

  if (!info._id) {
    info._id = uuid.v1();
  }

  info.creator = { _id: creatorId, name: creatorName };
  info.department = { _id: departmentId, name: departmentName };
  const t = new Date();
  info.createdTime = t;
  info.lastModifyTime = t;

  catalogTaskInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

const setCatalogInfoAndFileInfoAvailable = function setCatalogInfoAndFileInfoAvailable(objectId, available, cb) {
  let val = '';

  const q = {
    available: '',
  };

  if (available === CatalogInfo.AVAILABLE.NO) {
    q.flag = CatalogInfo.AVAILABLE.YES;
    val = CatalogInfo.AVAILABLE.NO;
  } else {
    q.flag = CatalogInfo.AVAILABLE.NO;
    val = CatalogInfo.AVAILABLE.YES;
  }

  let actionName = 'updateOne';

  if (objectId.indexOf(',') !== -1) {
    q.objectId = { $in: objectId.split(',') };
    actionName = 'udpateMany';
  } else {
    q.objectId = objectId;
  }

  const updateInfo = { $set: { available: val, lastModifyTime: new Date() } };

  catalogInfo.collection[actionName](q, updateInfo, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    fileInfo.collection[actionName](q, updateInfo, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

// 更新任务信息
service.updateCatalogTask = function updateCatalogTask(taskId, info, cb) {
  if (!taskId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCatalogTaskInfoIsNull'));
  }

  if (info._id) {
    delete info._id;
  }

  const q = {
    _id: taskId.trim(),
  };

  if (!info.lastModifyTime) {
    info.lastModifyTime = new Date();
  }

  catalogTaskInfo.updateOne(q, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (info.workflowStatus === CatalogTaskInfo.WORKFLOW_STATUS.SUCCESS) {
      catalogTaskInfo.collection.findOne({ _id: taskId }, { fields: { status: 1, objectId: 1 } }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(null, r);
        }

        if (doc.status === CatalogTaskInfo.STATUS.SUBMITTED) {
          setCatalogInfoAndFileInfoAvailable(doc.objectId, CatalogInfo.AVAILABLE.YES, (err, r) => cb && cb(err, r));
        } else {
          return cb && cb(null, r);
        }
      });
    } else {
      return cb && cb(null, r);
    }
  });
};

// 删除任务
service.deleteCatalogTask = function deleteCatalogTask(taskIds, cb) {
  if (!taskIds || taskIds.length === 0) {
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
    lastModifyTime: new Date(),
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    // 将相关的编目信息及文件变为不可见
    catalogTaskInfo.collection.find({
      _id: query._id,
      workflowStatus: CatalogTaskInfo.WORKFLOW_STATUS.SUCCESS,
    }).project(utils.formatSortOrFieldsParams('objectId', false)).toArray((err, items) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (items.length === 0) {
        return cb && cb(null, r);
      }

      const objectIds = [];
      for (let i = 0, len = items.length; i < len; i++) {
        objectIds.push(items[i].objectId);
      }

      setCatalogInfoAndFileInfoAvailable(objectIds.join(','), CatalogInfo.AVAILABLE.NO, (err, r) => cb && cb(null, r));
    });
  });
};

// 任务派发
service.assignCatalogTask = function assignCatalogTask(taskIds, ownerId, assigneeId, assigneeName, cb) {
  if (!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if (!ownerId) {
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
    if (err) {
      return cb && cb(err);
    }

    catalogTaskInfo[actionName](query, {
      owner: { _id: ownerId, name: doc.name },
      assignee: { _id: assigneeId, name: assigneeName },
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.DOING,
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

// 任务认领
service.applyCatalogTask = function applyCatalogTask(taskIds, ownerId, ownerName, cb) {
  if (!taskIds || taskIds.length === 0) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if (!ownerId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  if (!ownerName) {
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
    status: CatalogTaskInfo.STATUS.DOING,
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

// 退回操作
service.sendBackCatalogTask = function sendBackCatalogTask(taskIds, sendBackerId, sendBackerName, cb) {
  if (!taskIds || taskIds.length === 0) {
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

  // 只有在编目中这状态下的才可以退回
  query.status = CatalogTaskInfo.STATUS.DOING;

  catalogTaskInfo.collection.find(query).project(utils.formatSortOrFieldsParams('objectId,_id')).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('libraryCatalogTaskSubmitNull'));
    }

    const objectIds = [];

    for (let i = 0, len = docs.length; i < len; i++) {
      objectIds.push(docs[i].objectId);
    }

    catalogTaskInfo[actionName](query, {
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.PREPARE,
      lastSendBacker: { _id: sendBackerId, name: sendBackerName },
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      setCatalogInfoAndFileInfoAvailable(objectIds, CatalogInfo.AVAILABLE.NO, (err, r) => cb && cb(null, r));
    });
  });
};

// 提交操作
service.submitCatalogTask = function submitCatalogTask(taskIds, submitterId, submitterName, cb) {
  if (!taskIds || taskIds.length === 0) {
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

  // 只有在编目中这状态下的才可以退回
  query.status = CatalogTaskInfo.STATUS.DOING;

  catalogTaskInfo.collection.find(query).project(utils.formatSortOrFieldsParams('objectId,_id')).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('libraryCatalogTaskSubmitNull'));
    }

    const objectIds = [];

    for (let i = 0, len = docs.length; i < len; i++) {
      objectIds.push(docs[i].objectId);
    }

    catalogTaskInfo[actionName](query, {
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.PREPARE,
      lastSubmitter: { _id: submitterId, name: submitterName },
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      setCatalogInfoAndFileInfoAvailable(objectIds, CatalogInfo.AVAILABLE.YES, (err, r) => cb && cb(null, r));
    });
  });
};

// 恢复操作，删除后才可以进行此操作
service.resumeCatalogTask = function resumeCatalogTask(taskIds, cb) {
  if (!taskIds || taskIds.length === 0) {
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

  // 只有在编目中这状态下的才可以退回
  query.status = CatalogTaskInfo.STATUS.DELETE;

  catalogTaskInfo.collection.find(query).project(utils.formatSortOrFieldsParams('objectId,_id')).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('libraryCatalogTaskSubmitNull'));
    }

    const objectIds = [];

    for (let i = 0, len = docs.length; i < len; i++) {
      objectIds.push(docs[i].objectId);
    }

    catalogTaskInfo[actionName](query, {
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.PREPARE,
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      setCatalogInfoAndFileInfoAvailable(objectIds, CatalogInfo.AVAILABLE.NO, (err, r) => cb && cb(null, r));
    });
  });
};

/* catalog task */

/* catalog info */

service.listCatalog = function listCatalog(objectId, cb) {
  if (!objectId) {
    return cb && cb(i18n.t('libraryObjectIdIsNull'));
  }

  catalogInfo.collection.find({ objectId }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.createCatalog = function createCatalog(ownerId, ownerName, info, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoIsNull'));
  }

  if (!info.objectId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'objectId' }));
  }

  if (!info.fileId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'fileId' }));
  }

  if (!ownerId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'ownerId' }));
  }

  if (!ownerName) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'ownerName' }));
  }

  info.owner = { _id: ownerId, name: ownerName };

  if (!info._id) {
    info._id = uuid.v1();
  }

  if (parentId) {
    catalogInfo.collection.findOne({ _id: parentId }, { fields: { _id: true } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('libraryParentCatalogIsNotExist'));
      }

      catalogInfo.insertOne(info, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, r);
      });
    });
  } else {
    catalogInfo.insertOne(info, () => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  }
};

service.updateCatalog = function updateCatalog(id, info, cb) {
  if (!id) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'id' }));
  }

  if (info._id) {
    delete info._id;
  }

  info.lastModifyTime = new Date();

  catalogInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

/* catalog info */

/* file */

service.listFile = function listCatalog(objectId, cb) {
  if (!objectId) {
    return cb && cb(i18n.t('libraryObjectIdIsNull'));
  }

  fileInfo.collection.find({ objectId }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.createFile = function createFile(info, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryFileInfoIsNull'));
  }

  if (!info.objectId) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: 'objectId' }));
  }

  if (info._id) {
    info._id = uuid.v1();
  }

  fileInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateFile = function updateFile(id, info = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: 'id' }));
  }

  info.lastModifyTime = new Date();

  fileInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

/* file */

module.exports = service;
