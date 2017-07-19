/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const GroupInfo = require('./groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const userService = require('./userService');

let service = {};

service = utils.softMerge(service, userService);

service.listGroup = function listGroup(parentId, type, page, pageSize, cb) {
  const q = {};

  if (parentId) {
    q.parentId = parentId;
  }

  if (type !== '') {
    q.type = type;
  }

  groupInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const listArr = docs.docs;
    const rs = [];
    for (let i = 0, len = listArr.length; i < len; i++) {
      const temp = listArr[i];
      temp.children = [];
      for (let j = 0; j < len; j++) {
        const temp1 = listArr[j];
        if (temp1.parentId === temp._id) {
          temp.children.push(temp1._id);
        }
      }
      rs.push(temp);
    }
    docs.docs = rs;
    return cb && cb(null, docs);
  });
};

service.listAllChildGroup = function listAllChildGroup(id, fields, cb) {
  let groups = [];

  fields = utils.formatSortOrFieldsParams(fields);

  const ids = id.constructor === Array ? id : [id];

  const listGroup = function listGroup(ids) {
    groupInfo.collection.find({ parentId: { $in: ids } }).project(fields).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!docs || docs.length === 0) {
        return cb && cb(null, groups);
      }

      groups = groups.concat(docs);
      const temp = [];

      for (let i = 0, len = docs.length; i < len; i++) {
        temp.push(docs[i]._id);
      }

      listGroup(temp);
    });
  };

  listGroup(ids);
};

service.getGroup = function getGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  groupInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('cannotFindGroup'));
    }

    return cb && cb(null, doc);
  });
};

service.addGroup = function addGroup(info, cb) {
  const parentId = info.parentId || '';
  if (!parentId && info.type !== GroupInfo.TYPE.COMPANY) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  if (!info.parentId) {
    info.parentId = parentId;
  }

  const canInsertGroup = function canInsertGroup(parentId, info, cb) {
    const type = info.type;
    const name = info.name;

    groupInfo.collection.findOne({ name, parentId }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (doc) {
        return cb && cb(i18n.t('groupNameIsAlreadyExist'));
      }

      if (type === GroupInfo.TYPE.COMPANY) {
        return cb && cb(null);
      }

      groupInfo.collection.findOne({ _id: parentId }, { fields: { _id: 1 } }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(i18n.t('aboveGroupIsNotExist'));
        }

        return cb && cb(null);
      });
    });
  };

  canInsertGroup(parentId, info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    groupInfo.insertOne(info, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

const updateGroupDetail = function updateGroupDetail(id, updateDoc, cb) {
  groupInfo.updateOne({ _id: id }, updateDoc, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.updateGroup = function updateGroup(id, updateDoc, cb) {
  if (!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  groupInfo.collection.findOne({ _id: id }, { fields: { _id: 1, parentId: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (updateDoc.parentId && updateDoc.parentId !== doc.parentId) {
      groupInfo.collection.findOne({ _id: updateDoc.parentId }, { fields: { _id: 1 } }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(i18n.t('parentGroupInfoIsNotExist'));
        }
        updateGroupDetail(id, updateDoc, cb);
      });
    } else {
      updateGroupDetail(id, updateDoc, cb);
    }
  });
};

service.deleteGroup = function deleteGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  const removeGroup = function removeGroup(type, groupIds, callback) {
    const q = {};
    const updateDoc = {};

    if (type === GroupInfo.TYPE.COMPANY) {
      q.company = {};
      q.company._id = id;
      updateDoc.company = {};
      updateDoc.department = {};
      updateDoc.team = {};
    } else if (type === GroupInfo.TYPE.DEPARTMENT) {
      q.department = {};
      q.department._id = id;
      updateDoc.department = {};
      updateDoc.team = {};
    } else if (type === GroupInfo.TYPE.TEAM) {
      q.team = {};
      q.team._id = id;
      updateDoc.team = {};
    }

    userInfo.collection.updateMany(q, { $set: updateDoc }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      groupInfo.collection.removeMany({ _id: { $in: groupIds } }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return callback && callback(null);
      });
    });
  };
  const listAllChildGroup = function listAllChildGroup(callback) {
    service.listAllChildGroup(id, '_id,deleteDeny,name', (err, groups) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      const deleteDenyName = [];
      const groupIds = [];

      groupIds.push(id);

      for (let i = 0, len = groups.length; i < len; i++) {
        if (groups[i].deleteDeny === GroupInfo.DELETE_DENY.YES) {
          deleteDenyName.push(groups[i].name);
        }
        groupIds.push(groups[i]._id);
      }

      if (deleteDenyName.length !== 0) {
        return cb && cb(i18n.t('cannotDeleteProtectGroup', { groupNames: deleteDenyName.join(',') }));
      }

      return callback && callback(groupIds);
    });
  };
  const getRootGroup = function getRootGroup(callback) {
    groupInfo.collection.findOne(
      { _id: id }, { fields: { _id: 1, type: 1, deleteDeny: 1 } }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(i18n.t('groupIsNotExist'));
        }

        if (doc.deleteDeny === GroupInfo.DELETE_DENY.YES) {
          return cb && cb(i18n.t('groupDeleteDenyIsYes'));
        }

        return callback && callback(doc);
      });
  };

  getRootGroup((doc) => {
    listAllChildGroup((groupIds) => {
      removeGroup(doc.type, groupIds, err => cb && cb(err, 'ok'));
    });
  });
};

service.updateGroupInfo = function updateGroupInfo(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    name: { type: 'string', validation: 'require' },
    deleteDeny: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  groupInfo.collection.updateOne({ _id: info._id }, { $set: info }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};


module.exports = service;
