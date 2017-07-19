/**
 * Created by steven on 2017/7/18.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const GroupInfo = require('./groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const RoleInfo = require('../role/roleInfo');

const roleInfo = new RoleInfo();

const PermissionInfo = require('../role/permissionInfo');

const permissionInfo = new PermissionInfo();

const PermissionAssignmentInfo = require('../role/permissionAssignmentInfo');

const permissionAssignmentInfo = new PermissionAssignmentInfo();

const config = require('../../config');

const service = {};


service.getGroupUserDetail = function getGroupUserDetail(_id, fields, cb) {
  userInfo.getUserInfo(_id, fields, (err, doc) => cb && cb(err, doc));
};

const getGroups = function getGroupUsers(query, cb) {
  groupInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('cannotFindGroup'));
    }

    return cb && cb(null, docs);
  });
};

const fillUserInfo = function fillUserInfo(_ids, info, cb) {
  if (info.password) {
    info.password = utils.cipher(info.password, config.KEY);
  }

  if (!_ids || _ids.length === 0) {
    return cb && cb(null, info);
  }
  getGroups({ _id: { $in: _ids } }, (err, docs) => {
    if (err) {
      return cb && cb(err);
    }

    if (docs.length !== _ids.length) {
      return cb && cb(i18n.t('cannotFindGroup'));
    }

    for (let i = 0; i < docs.length; i++) {
      const group = docs[i];
      if (group.type === GroupInfo.TYPE.COMPANY) {
        info.company = {
          _id: group._id,
          name: group.name,
        };
      } else if (group.type === GroupInfo.TYPE.DEPARTMENT) {
        info.department = {
          _id: group._id,
          name: group.name,
        };
      } else if (group.type === GroupInfo.TYPE.TEAM) {
        info.team = {
          _id: group._id || '',
          name: group.name || '',
        };
      }
    }
    return cb && cb(null, info);
  });
};

service.addGroupUser = function addGroupUser(info, cb) {
  const _ids = [];

  if (!utils.checkPassword(info.password)) {
    return cb && cb(i18n.t('validationError', { field: 'password' }));
  }

  _ids.push(info.companyId);

  if (info.departmentId) {
    _ids.push(info.departmentId);
  }

  if (info.teamId) {
    _ids.push(info.teamId);
  }

  fillUserInfo(_ids, info, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.insertOne(info, (err) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, 'ok');
    });
  });
};

service.updateGroupUser = function updateGroupUser(info, cb) {
  const _ids = [];

  if (info.password) {
    if (!utils.checkPassword(info.password)) {
      return cb && cb(i18n.t('validationError', { field: 'password' }));
    }
  }

  if (info.companyId) {
    _ids.push(info.companyId);
  } else if (info.companyId === '') {
    info.company = {
      _id: '',
      name: '',
    };
  }

  if (info.departmentId) {
    _ids.push(info.departmentId);
  } else if (info.departmentId === '') {
    info.department = {
      _id: '',
      name: '',
    };
  }

  if (info.teamId) {
    _ids.push(info.teamId);
  } else if (info.teamId === '') {
    info.team = {
      _id: '',
      name: '',
    };
  }

  fillUserInfo(_ids, info, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.updateOne(
      { _id: info._id }, info, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
  });
};

service.justifyUserGroup = function justifyUserGroup(info, cb) {
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    departmentId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  const groupIds = [];
  groupIds.push(info.departmentId);
  if (info.teamId) {
    groupIds.push(info.teamId);
  }

  const updeteInfo = {};
  const _ids = info._ids.split(',');

  fillUserInfo(groupIds, updeteInfo, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.collection.updateMany(
      { _id: { $in: _ids } }, { $set: info }, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
  });
};

service.getGroupUserList = function getGroupUserList(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { return utils.isValueInObject(v, GroupInfo.TYPE); } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const _id = info._id;
  const type = info.type;
  const page = info.page || 1;
  const pageSize = info.pageSize || 30;
  const keyword = info.keyword || '';
  const query = {};

  if (type === GroupInfo.TYPE.COMPANY) {
    query['company._id'] = _id;
  } else if (type === GroupInfo.TYPE.DEPARTMENT) {
    query['department._id'] = _id;
  } else {
    query['team._id'] = _id;
  }

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  userInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.updateOwnerPermission = function updateOwnerPermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { return utils.isValueInObject(v, PermissionAssignmentInfo.TYPE); } },
    roles: { type: 'array', validation: 'require' },
    permissions: { type: 'array', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }
  const permissions = info.permissions;
  const roles = info.roles;
  const allowedPermissions = [];
  const deniedPermissions = [];
  const tempRoles = [];
  for (let i = 0, len = permissions.length; i < len; i++) {
    if (permissions[i].action === '允许') {
      allowedPermissions.push(permissions[i].path);
    } else {
      deniedPermissions.push(permissions[i].path);
    }
  }
  for (let i = 0, len = roles.length; i < len; i++) {
    tempRoles.push(roles[i]._id);
  }
  const updateInfo = {
    _id: info._id,
    type: info.type,
    roles: tempRoles,
    allowedPermissions,
    deniedPermissions,
    modifyTime: new Date(),
  };

  permissionAssignmentInfo.collection.updateOne({ _id: info._id }, { $set: updateInfo }, { upsert: true }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb & cb(null);
  });
};

service.getOwnerPermission = function getOwnerPermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const getRoles = function getRoles(roles, callback) {
    if (!roles || roles.length === 0) {
      return callback && callback(null, []);
    }
    roleInfo.collection.find({ _id: { $in: roles } }, { fields: { name: 1 } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    });
  };

  const getPermissions = function getPermissions(permissions, callback) {
    if (!permissions || permissions.length === 0) {
      return callback && callback(null, []);
    }
    permissionInfo.collection.find({ path: { $in: permissions } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    });
  };

  permissionAssignmentInfo.collection.findOne({ _id: info._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, { _id: '', type: '', roles: [], permissions: [] });
    }

    const rs = {
      _id: doc._id,
      type: doc.type,
    };
    const roles = doc.roles || [];
    const allowedPermissions = doc.allowedPermissions || [];
    const deniedPermissions = doc.deniedPermissions || [];
    const permissions = [];

    getRoles(roles, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      rs.roles = docs;

      getPermissions(allowedPermissions, (err, docs) => {
        if (err) {
          return cb && cb(err);
        }

        for (let i = 0, len = docs.length; i < len; i++) {
          const temp = docs[i];
          temp.action = '允许';
          permissions.push(temp);
        }

        getPermissions(deniedPermissions, (err, docs) => {
          if (err) {
            return cb && cb(err);
          }

          for (let i = 0, len = docs.length; i < len; i++) {
            const temp = docs[i];
            temp.action = '拒绝';
            permissions.push(temp);
          }
          rs.permissions = permissions;

          return cb && cb(null, rs);
        });
      });
    });
  });
};

service.getOwnerEffectivePermission = function getOwnerEffectivePermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }
};

service.searchUser = function searchUser(info, cb) {
  const struct = {
    companyId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const keyword = info.keyword || '';
  const limit = 6;
  const query = {};
  query['company._id'] = info.companyId;
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  userInfo.collection.find(query, { fields: { name: 1, photo: 1, email: 1, phone: 1 } }).limit(limit).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.enableGroupUser = function enableGroupUser(info, cb) {
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    status: { type: 'string', validation(v) { if (v === UserInfo.STATUS.NORMAL || v === UserInfo.STATUS.UNACTIVE) { return true; } return false; } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const _ids = info._ids.split(',');
  const status = info.status;

  userInfo.collection.updateMany({ _id: { $in: _ids } }, { $set: { status } },
    (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
};
module.exports = service;
