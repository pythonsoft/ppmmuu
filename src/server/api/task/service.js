/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const TaskInfo = require('./taskInfo');

const taskInfo = new TaskInfo();

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
    if (childTasksInfo.constructor === Array) {
      for (let i = 0, len = childTasksInfo.length; i < len; i++) {
        if (!childTasksInfo[i]._id) {
          childTasksInfo[i]._id = uuid.v1();
        }
        childTasksInfo[i].parentId = parentId;
        childTasksInfo[i].createdTime = new Date();
        childTasksInfo[i].creator = creator;
        ts.push(taskInfo.assign(childTasksInfo[i]));
      }
    }
  }

  return ts;
};

service.addTask = function addTask(parentTaskInfo, childTasksInfo, cb) {
  if (utils.isEmptyObject(parentTaskInfo)) {
    return cb && cb(i18n.t('parentTaskInfoIsNull'));
  }

  if (utils.isEmptyObject(parentTaskInfo.creator)) {
    return cb && cb(i18n.t('taskCreatorIsNull'));
  }

  const pInfo = taskInfo.assign(parentTaskInfo);

  if (!pInfo.target) {
    return cb && cb(i18n.t('taskTargetIsNull'));
  }

  const time = new Date();
  pInfo.createdTime = time;
  pInfo.modifyTime = time;

  if (!pInfo._id) {
    pInfo._id = uuid.v1();
  }

  const ts = componentChildTaskInfo(pInfo._id, pInfo.creator, childTasksInfo);
  ts.push(pInfo);

  taskInfo.collection.insertMany(ts, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.addChildTasks = function addChildTasks(parentId, childTasksInfo, cb) {
  if (!parentId) {
    return cb && cb(i18n.t('parentIdIsNull'));
  }

  taskInfo.collection.findOne({ _id: parentId }, { fields: { _id: 1, creator: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('taskInfoIsNull'));
    }

    const ts = componentChildTaskInfo(parentId, doc.creator, childTasksInfo);

    taskInfo.collection.insertMany(ts, (err, r) => {
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

    taskInfo.collection.updateOne({ _id: id }, taskInfo.updateAssign(info), (err, r) => {
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

module.exports = service;
