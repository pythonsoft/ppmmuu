/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const GroupInfo = require('./groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const config = require('../../config');

const service = {};

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

    return cb && cb(null, docs);
  });
};

service.listAllChildGroup = function listAllChildGroupfunction(id, fields, cb) {
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

service.listAllParentGroup = function listAllParentGroup(parentId, fields, cb) {
  let groups = [];
  fields = utils.formatFields(fields);

  const listGroup = function listGroup(parentId) {
    groupInfo.collection.findOne({ _id: parentId }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null, groups);
      }

      groups = groups.concat(doc);
      listGroup(doc.parentId);
    });
  };

  listGroup(parentId);
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

service.addGroup = function addGroup(parentId, info, cb) {
  if (!groupInfo.validateType(info.type)) {
    return cb && cb(i18n.t('groupTypeIsUnValidate'));
  }

  if (!info.name) {
    return cb && cb(i18n.t('groupNameIsNull'));
  }

  if (!parentId && info.type !== GroupInfo.TYPE.COMPANY) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  info._id = info._id || uuid.v1();
  info.count = info.count ? info.count * 1 : 0;
  if (typeof info.count !== 'number') {
    info.count = 0;
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

    groupInfo.collection.insertOne(groupInfo.assign(info), (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, {});
    });
  });
};

const updateGroupDetail = function updateGroupDetail(id, updateDoc, cb) {
  groupInfo.collection.updateOne({ _id: id }, { $set: updateDoc }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateGroup = function updateGroup(id, updateInfo, cb) {
  if (!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  const updateDoc = groupInfo.updateAssign(updateInfo);

  if (updateDoc.count) {
    updateDoc.count *= 1;
    if (typeof updateDoc.count !== 'number') {
      updateDoc.count = 0;
    }
  }

  if (updateDoc.parentId) {
    groupInfo.collection.findOne(
      { _id: updateDoc.parentId }, { fields: { _id: 1 } }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          delete updateDoc.parentId;
        }
        updateGroupDetail(id, updateDoc, cb);
      });
  } else {
    updateGroupDetail(id, updateDoc, cb);
  }
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

      groupInfo.collection.removeMany({ _id: { $in: groupIds } }, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return callback && callback(r);
      });
    });
  };
  const listAllChildGroup = function listAllChildGroup(callback) {
    service.listAllChildGroup(id, { _id: 1, deleteDeny: 1, name: 1 }, (err, groups) => {
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
      removeGroup(doc.type, groupIds, r => cb && cb(null, r));
    });
  });
};

service.getGroupUserDetail = function getGroupUserDetail(_id, fields, cb) {
  userInfo.getUserInfo(_id, fields, (err, doc) => cb && cb(err, doc));
};

service.addGroupUser = function addGroupUser(info, cb) {
  const err = userInfo.validateCreateError(userInfo.createGroupUserNeedValidateFields, info);

  if (err) {
    return cb && cb(err);
  }

  info._id = info.email;
  info.password = utils.cipher(info.password, config.KEY);

  service.getGroup(info.companyId, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    info.company = {
      _id: doc._id,
      name: doc.name,
    };

    service.getGroup(info.departmentId, (err, doc) => {
      if (err && err.code !== i18n.t('groupIdIsNull.code')) {
        return cb && cb(err);
      }

      if (doc) {
        info.department = {
          _id: doc._id,
          name: doc.name,
        };
      }

      service.getGroup(info.teamId, (err, doc) => {
        if (err && err.code !== i18n.t('groupIdIsNull.code')) {
          return cb && cb(err);
        }

        if (doc) {
          info.team = {
            _id: doc._id || '',
            name: doc.name || '',
          };
        }

        userInfo.checkUnique(info, false, (err) => {
          if (err) {
            return cb && cb(err);
          }

          userInfo.collection.insertOne(userInfo.assign(info), (err, r) => {
            if (err) {
              return cb && cb(i18n.t('databaseError'));
            }

            return cb && cb(null, r);
          });
        });
      });
    });
  });
};

service.updateGroupUser = function updateGroupUser(info, cb) {
  const err = userInfo.validateUpdateError(userInfo.updateNeedValidateFields, info);

  if (err) {
    return cb && cb(err);
  }

  if (info.password) {
    info.password = utils.cipher(info.password, config.KEY);
  }

  const getGroup = function getGroup(id, key, info, cb) {
    if (id === undefined) {
      return cb && cb(null, info);
    } else if (id === '') {
      info[key] = {
        _id: '',
        name: '',
      };
      return cb && cb(null, info);
    }
    service.getGroup(id, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }
      info[key] = {
        _id: doc._id,
        name: doc.name,
      };
      return cb && cb(null, info);
    });
  };

  getGroup(info.companyId, 'company', info, (err, info) => {
    if (err) {
      return cb && cb(err);
    }
    getGroup(info.departmentId, 'department', info, (err, info) => {
      if (err) {
        return cb && cb(err);
      }
      getGroup(info.teamId, 'team', info, (err, info) => {
        if (err) {
          return cb && cb(err);
        }

        userInfo.checkUnique(info, true, (err) => {
          if (err) {
            return cb && cb(err);
          }

          userInfo.collection.updateOne(
            { _id: info._id }, { $set: userInfo.updateAssign(info) }, (err, r) => {
              if (err) {
                return cb && cb(i18n.t('databaseError'));
              }

              return cb && cb(null, r);
            });
        });
      });
    });
  });
};

module.exports = service;
