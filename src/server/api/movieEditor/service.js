/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const ProjectInfo = require('./projectInfo');

const projectInfo = new ProjectInfo();

const ItemInfo = require('./ItemInfo');

const itemInfo = new ItemInfo();

const service = {};

service.listAllParentTask = function listAllParentTask(creatorId, status, page, pageSize, cb, sortFields, fieldsNeed) {
  const q = { parentId: '' };

  if (creatorId) {
    q.creator._id = creatorId;
  }

  if (status) {
    q.status = status;
  }

  taskInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.listChildTask = function listChildTask(ids, cb, sortFields, fieldsNeed) {
  if (!ids) {
    return cb && cb(i18n.t('taskIdIsNull'));
  }

  const idArray = utils.trim(ids.split(','));
  let cursor = taskInfo.collection.find({ _id: { $in: idArray } });
  if (fieldsNeed) {
    cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
  }

  if (sortFields) {
    cursor = cursor.sort(utils.formatSortOrFieldsParams(sortFields, true));
  }

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getTaskDetail = function getTaskDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  taskInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

const componentChildTaskInfo = function componentChildTaskInfo(parentId, creator, childTasksInfo) {
  const ts = [];

  if (!utils.isEmptyObject(childTasksInfo)) {
    let arr = [];

    if (childTasksInfo.constructor !== Array) {
      arr.push(childTasksInfo);
    } else {
      arr = childTasksInfo;
    }

    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].parentId = parentId;
      arr[i].creator = creator;
      ts.push(arr[i]);
    }
  }

  return ts;
};

service.addTask = function addTask(creatorId, creatorName, creatorType, parentTaskInfo, childTasksInfo, cb) {
  if (!creatorId || !creatorName || !creatorType) {
    return cb && cb(i18n.t('taskCreatorIdNameTypeIsNull'));
  }

  if (utils.isEmptyObject(parentTaskInfo)) {
    return cb && cb(i18n.t('parentTaskInfoIsNull'));
  }

  if (!parentTaskInfo.target) {
    return cb && cb(i18n.t('taskTargetIsNull'));
  }

  parentTaskInfo.creator = { _id: creatorId, name: creatorName, type: creatorType };

  const ts = componentChildTaskInfo(parentTaskInfo._id, parentTaskInfo.creator, childTasksInfo);
  ts.push(parentTaskInfo);

  taskInfo.insertMany(ts, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.addChildTasks = function addChildTasks(creatorId, creatorName, creatorType, parentId, childTasksInfo, cb) {
  if (!parentId) {
    return cb && cb(i18n.t('parentIdIsNull'));
  }

  taskInfo.collection.findOne({ _id: parentId }, { fields: { _id: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('taskInfoIsNull'));
    }

    const creator = { _id: creatorId, name: creatorName, type: creatorType };
    const ts = componentChildTaskInfo(parentId, creator, childTasksInfo);

    taskInfo.insertMany(ts, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.updateTask = function updateTask(id, info, cb) {
  if (!id) {
    return cb && cb(i18n.t('taskIdIsNull'));
  }

  taskInfo.collection.find({ _id: id }).project({ _id: 1 }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (docs.length === 0) {
      return cb && cb(i18n.t('taskInfoIsNull'));
    }

    info.modifyTime = new Date();

    taskInfo.updateOne({ _id: id }, info, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.deleteTasks = function deleteRoles(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('taskIdIsNull'));
  }

  taskInfo.collection.removeMany({ _id: { $in: utils.trim(ids.split(',')) } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.listMyResource = function listMyResource(creatorId, cb, sortFields, fieldsNeed) {
  if(!creatorId) {
    return cb && cb(i18n.t('databaseError'));
  }
};

module.exports = service;
