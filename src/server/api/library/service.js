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

const TemplateInfo = require('./templateInfo');

const templateInfo = new TemplateInfo();

const userService = require('../user/service');
const groupService = require('../group/service');
const fieldMap = require('./fieldMap');

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

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
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
  query.workflowStatus = CatalogTaskInfo.WORKFLOW_STATUS.SUCCESS;   // 只列出入库成功的任务

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

  catalogTaskInfo.insertOne(info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(err);
    }

    return cb && cb(null, { _id: info._id });
  });
};

const setCatalogInfoAndFileInfoAvailable = function setCatalogInfoAndFileInfoAvailable(objectId, available, cb, owner) {
  const q = {
    available: '',
  };

  const updateInfo = {
    available,
    lastModifyTime: new Date(),
  };

  if (available === CatalogInfo.AVAILABLE.NO) {
    q.available = CatalogInfo.AVAILABLE.YES;
  } else {
    q.available = CatalogInfo.AVAILABLE.NO;
    updateInfo.publishTime = updateInfo.lastModifyTime;
  }
  if (owner) {
    updateInfo.owner = owner;
  }

  if (objectId.indexOf(',') !== -1) {
    q.objectId = { $in: objectId.split(',') };
  } else if (utils.getValueType(objectId) === 'array') {
    q.objectId = { $in: objectId };
  } else {
    q.objectId = objectId;
  }

  catalogInfo.collection.updateMany(q, { $set: updateInfo }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(err);
    }

    const fileUpdateInfo = {
      available,
      lastModifyTime: new Date(),
    };
    fileInfo.collection.updateMany(q, { $set: fileUpdateInfo }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
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
      return cb && cb(err);
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
service.deleteCatalogTask = function deleteCatalogTask(taskIds, lastDeleterId, lastDeleterName, cb) {
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
    lastDeleter: { _id: lastDeleterId, name: lastDeleterName },
  }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(err);
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

const updateCatalogInfoOwner = function updateCatalogInfoOwner(query, owner, cb) {
  catalogTaskInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(err);
    }
    const objectIds = [];
    if (docs && docs.length) {
      docs.forEach((item) => {
        objectIds.push(item.objectId);
      });
    }
    if (objectIds.length === 0) {
      return cb && cb(null);
    }
    const updateInfo = {
      owner,
      lastModifyTime: new Date(),
    };
    catalogInfo.collection.updateMany({ objectId: { $in: objectIds } }, { $set: updateInfo }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
      }
      return cb && cb(null);
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

    const owner = { _id: ownerId, name: doc.name };

    updateCatalogInfoOwner(query, owner, (err) => {
      if (err) {
        return cb && cb(err);
      }
      catalogTaskInfo[actionName](query, {
        owner,
        assignee: { _id: assigneeId, name: assigneeName },
        lastModifyTime: new Date(),
        status: CatalogTaskInfo.STATUS.DOING,
      }, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }
        return cb && cb(null, r);
      });
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
  const owner = { _id: ownerId, name: ownerName };

  updateCatalogInfoOwner(query, owner, (err) => {
    if (err) {
      return cb && cb(err);
    }
    catalogTaskInfo[actionName](query, {
      owner,
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.DOING,
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
      }
      return cb && cb(null, r);
    });
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
  query.status = { $in: [CatalogTaskInfo.STATUS.DOING, CatalogTaskInfo.STATUS.SUBMITTED, CatalogTaskInfo.STATUS.DELETE] };

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
    }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
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
    const submitter = { _id: submitterId, name: submitterName };
    catalogTaskInfo[actionName](query, {
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.SUBMITTED,
      lastSubmitter: submitter,
    }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
      }

      setCatalogInfoAndFileInfoAvailable(objectIds, CatalogInfo.AVAILABLE.YES, (err, r) => cb && cb(null, r), submitter);
    });
  });
};

// 恢复任务，删除后才可以进行此操作
service.resumeCatalogTask = function resumeCatalogTask(taskIds, resumeId, resumeName, cb) {
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
      return cb && cb(i18n.t('libraryCatalogTaskResumeNull'));
    }

    const objectIds = [];

    for (let i = 0, len = docs.length; i < len; i++) {
      objectIds.push(docs[i].objectId);
    }

    catalogTaskInfo[actionName](query, {
      lastModifyTime: new Date(),
      status: CatalogTaskInfo.STATUS.PREPARE,
      lastResume: { _id: resumeId, name: resumeName },
    }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
      }

      setCatalogInfoAndFileInfoAvailable(objectIds, CatalogInfo.AVAILABLE.NO, (err, r) => cb && cb(null, r));
    });
  });
};

service.getCatalogTask = function getCatalogTask(taskId, cb) {
  if (!taskId) {
    return cb && cb(i18n.t('libraryCatalogTaskIdIsNull'));
  }

  catalogTaskInfo.collection.findOne({ _id: taskId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.getCatalogByObjectId = function getCatalogByObjectId(objectId, fields, cb) {
  if (!objectId) {
    return cb && cb(i18n.t('libraryCatalogObjectIdIsNull'));
  }

  const options = {};

  if (fields) {
    options.fields = fields;
  }

  catalogTaskInfo.collection.findOne({ objectId }, options, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
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

    fileInfo.collection.findOne({ objectId, type: FileInfo.TYPE.LOW_BIT_VIDEO }, (err, file) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!file) {
        return cb && cb(i18n.t('canNotFindLowVideo'));
      }
      if (docs && docs.length) {
        for (let i = 0, len = docs.length; i < len; i++) {
          docs[i].fileInfo = file;
        }
      }
      return cb && cb(null, docs);
    });
  });
};

const formatDuration = function formatDuration(info) {
  if (info.outpoint) {
    const timeLen = ((info.outpoint - info.inpoint) * 1.0) / 25;
    info.duration = utils.transformSecondsToStr(timeLen);
  }
};

service.createCatalog = function createCatalog(ownerId, ownerName, info, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoIsNull'));
  }

  if (!info.objectId) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'objectId' }));
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
  if (info.hdFlag) {
    info.hdFlag *= 1;
  }
  if (info.outpoint) {
    info.outpoint *= 1;
  }
  if (info.inpoint) {
    info.inpoint *= 1;
  }
  formatDuration(info);

  if (info.parentId) {
    catalogInfo.collection.findOne({ _id: info.parentId }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('libraryParentCatalogIsNotExist'));
      }

      if (!info.source) {
        info.source = doc.source;
      }

      info.root = doc.root || doc._id;

      info.department = doc.department;

      catalogInfo.insertOne(info, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }

        return cb && cb(null, { _id: info._id });
      });
    });
  } else {
    catalogInfo.insertOne(info, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err);
      }

      return cb && cb(null, { _id: info._id });
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

  if (info.hdFlag) {
    info.hdFlag *= 1;
  }
  if (info.outpoint) {
    info.outpoint *= 1;
  }
  if (info.inpoint) {
    info.inpoint *= 1;
  }

  catalogInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.getCatalog = function getCatalog(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('libraryCreateCatalogInfoFieldIsNull', { field: 'id' }));
  }

  catalogInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    formatDuration(doc);
    return cb && cb(null, doc);
  });
};

service.getCatalogInfosTranslation = function getCatalogInfosTranslation(objectId, cb) {
  if (!objectId) {
    return cb && cb(i18n.t('objectIdIsNull'));
  }
  catalogInfo.collection.find({ objectId }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const rs = [];
    if (!docs || docs.length === 0) {
      return cb && cb(null, rs);
    }
    const fields = fieldMap.translateFields;
    for (let i = 0, len = docs.length; i < len; i++) {
      const doc = docs[i];
      const item = {};
      for (const key in fields) {
        if (doc[key] !== undefined) {
          item[key] = {
            cn: fields[key].cn,
            value: doc[key],
          };
          if (fields[key].format) {
            item[key].value = fields[key].format(doc[key]);
          }
        }
      }
      rs.push(item);
    }
    return cb && cb(null, rs);
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

    catalogInfo.collection.findOne({ objectId }, (err, cata) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      let duration = 0;
      if (cata && cata.outpoint) {
        duration = cata.outpoint - cata.inpoint;
      }
      for (let i = 0, len = docs.length; i < len; i++) {
        docs[i].duration = duration * 40;
      }
      return cb && cb(null, docs);
    });
  });
};

service.createFile = function createFile(info, cb) {
  if (!info || utils.isEmptyObject(info)) {
    return cb && cb(i18n.t('libraryFileInfoIsNull'));
  }

  if (!info.objectId) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: 'objectId' }));
  }

  if (!info._id) {
    info._id = uuid.v1();
  }

  if (info.size) {
    info.size *= 1;
  }

  fileInfo.insertOne(info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(err);
    }

    return cb && cb(null, { _id: info._id });
  });
};

service.updateFile = function updateFile(id, info = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: 'id' }));
  }

  info.lastModifyTime = new Date();

  if (info._id) {
    delete info._id;
  }

  if (info.size) {
    info.size *= 1;
  }

  fileInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, 'ok');
  });
};

service.getFile = function getFile(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: 'id' }));
  }

  fileInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.getSourceFileAndSubtitleFile = function getSourceFileAndSubtitleFile(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: '_id' }));
  }

  const query = { $or: [{ _id }, { objectId: _id }] };
  catalogInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }
    const objectId = doc.objectId;

    fileInfo.collection.find({
      objectId,
      type: { $in: [FileInfo.TYPE.HIGH_VIDEO, FileInfo.TYPE.SUBTITLE] },
    }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, docs);
    });
  });
};

service.getSubtitleFile = function getSubtitleFile(id, cb) {
  service.getFile(id, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }
    const objectId = doc.objectId;
    let path = '';
    if (objectId) {
      fileInfo.collection.findOne({ objectId, type: FileInfo.TYPE.SUBTITLE }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        path = doc ? doc.realPath : '';
        return cb && cb(null, path);
      });
    } else {
      return cb && cb(null, path);
    }
  });
};

/* file */

const checkHdExt = function checkHdExt(hdExt) {
  const constructorType = hdExt.constructor;
  let arr = [];
  if (constructorType === String) {
    if (hdExt.indexOf(',')) {
      arr = hdExt.split(',');
    } else {
      arr = [hdExt];
    }
  } else if (constructorType !== Array) {
    return { err: i18n.t('libraryTemplateInfoFieldIsInvalid', { field: 'hdExt' }), result: '' };
  }

  return { err: null, result: arr };
};

/* 入库模板 */
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

service.getTemplateResult = function getTemplateResult(_id, filePath, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryTemplateInfoFieldIsNull', { field: '_id' }));
  }

  templateInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('libraryTemplateInfoIsNotExist'));
    }

    return cb && cb(null, templateInfo.getJobVo(doc));
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

service.getDefaultLibraryTemplateInfo = function getDefaultLibraryTemplateInfo(departmentId, cb) {
  templateInfo.collection.findOne({ 'department._id': departmentId }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('defaultLibraryTemplateNotFound'));
    }
    return cb && cb(null, doc);
  });
};

module.exports = service;

