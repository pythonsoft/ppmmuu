/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');

const i18n = require('i18next');

const utils = require('../../common/utils');

const config = require('../../config');

const AssignPermission = require('./permissionAssignmentInfo');

const assignPermission = new AssignPermission();

const RoleInfo = require('./roleInfo');

const roleInfo = new RoleInfo();

const PermissionInfo = require('./permissionInfo');

const permissionInfo = new PermissionInfo();

const GroupInfo = require('../group/groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const service = {};

/* role */
service.listRole = function listRole(page, pageSize, keyword, fields, cb) {
  const query = {};

  if (keyword) {
    query.$or = [{ _id: { $regex: keyword, $options: 'i' } }, { name: { $regex: keyword, $options: 'i' } }];
  }

  roleInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '', fields);
};

service.getRoleDetail = function getRoleDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  const getPermissions = function getPermissions(arr, callback) {
    if (!arr || arr.length === 0) {
      return callback && callback(null, []);
    }
    permissionInfo.collection.find({ path: { $in: arr } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    });
  };

  roleInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('canNotFindRole'));
    }

    const allowedPermissions = doc.allowedPermissions || [];
    const deniedPermissions = doc.deniedPermissions || [];

    getPermissions(allowedPermissions, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      doc.allowedPermissions = docs;

      getPermissions(deniedPermissions, (err, docs) => {
        if (err) {
          return cb && cb(err);
        }

        doc.deniedPermissions = docs;

        return cb && cb(null, doc);
      });
    });
  });
};

service.addRole = function addRole(_roleInfo, cb) {
  roleInfo.insertOne(_roleInfo, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, {});
  });
};

service.updateRole = function updateRole(info, cb) {
  const _roleInfo = {};
  _roleInfo._id = info._id;
  _roleInfo.name = info.name;
  _roleInfo.description = info.description || '';
  roleInfo.updateOne({ _id: _roleInfo._id }, _roleInfo, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, doc);
  });
};

service.deleteRoles = function deleteRoles(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    service.clearRedisCacheByRoles(ids, () => cb && cb(null, 'ok'));
  });
};

service.assignRole = function assignRole(info, cb) {
  const roles = info.roles;
  info.roles = roles.split(',');
  const rs = assignPermission.assign(info);
  const _id = info._id;
  if (rs.err) {
    return cb && cb(rs.err);
  }

  assignPermission.collection.insertOne(rs.doc, (err) => {
    if (!err) {
      return cb && cb(null);
    }

    assignPermission.collection.updateOne({ _id }, { $addToSet: { roles }, $set: { modifyTime: new Date() } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      service.clearRedisCache(_id, () => cb && cb(null, 'ok'));
    });
  });
};

/**
 * @description clear redis cache by _id
 * @param _id
 */
service.clearRedisCache = function clearRedisCache(_id, cb) {
  let query = {};
  if (typeof _id === 'string') {
    query = { $or: [{ _id }, { 'company._id': _id }, { 'department._id': _id }, { 'team._id': _id }] };
  } else {
    query = { $or: [{ _id: { $in: _id } }, { 'company._id': { $in: _id } }, { 'department._id': { $in: _id } }, { 'team._id': { $in: _id } }] };
  }

  service.clearRedisCacheByUserQuery(query, cb);
};

service.clearRedisCacheByUserQuery = function clearRedisCacheByUserQuery(q, cb) {
  userInfo.collection.find(q, { fields: { _id: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs.length) {
      const idsArr = [];
      docs.forEach((item) => {
        idsArr.push(item._id);
      });
      config.redisClient.del(idsArr);
    }
    return cb && cb(null);
  });
};

/**
 * @description clear redis cache by permissions
 * @param permissions
 */
service.clearRedisCacheByPermissions = function clearRedisCache(permissions, cb) {
  const orArr = [];
  if (typeof permissions === 'string') {
    permissions = permissions.split(',');
  }
  permissions.forEach((permission) => {
    orArr.push({ allowedPermissions: permission });
    orArr.push({ deniedPermissions: permission });
  });

  const getRolesAndClearRedis = function getRolesAndClearRedis() {
    roleInfo.collection.find({ $or: orArr }, { fields: { _id: 1 } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (docs.length) {
        const idsArr = [];
        docs.forEach((item) => {
          idsArr.push(item._id);
        });
        service.clearRedisCacheByRoles(idsArr, cb);
      } else {
        return cb && cb(null);
      }
    });
  };

  assignPermission.collection.find({ $or: orArr }, { fields: { _id: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs.length) {
      const idsArr = [];
      docs.forEach((item) => {
        idsArr.push(item._id);
      });
      service.clearRedisCache(idsArr, (err) => {
        if (err) {
          return cb && cb(err);
        }
        getRolesAndClearRedis();
      });
    } else {
      getRolesAndClearRedis();
    }
  });
};

/**
 * @description clear redis cache by roles
 * @param role
 */
service.clearRedisCacheByRoles = function clearRedisCache(roles, cb) {
  const orArr = [];
  if (typeof roles === 'string') {
    roles = roles.split(',');
  }
  roles.forEach((role) => {
    orArr.push({ roles: role });
  });
  assignPermission.collection.find({ $or: orArr }, { fields: { _id: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs.length) {
      const idsArr = [];
      docs.forEach((item) => {
        idsArr.push(item._id);
      });
      service.clearRedisCache(idsArr, cb);
    } else {
      return cb && cb(null);
    }
  });
};

const listPermission = function listPermission(q, page, pageSize, sortFields, fieldsNeed, cb) {
  permissionInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.listPermission = function lPermission(roleId, status, name, page, pageSize, sortFields, fieldsNeed, cb) {
  if (roleId) {
    roleInfo.collection.findOne({ _id: roleId }, { fields: { permissions: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('roleInfoIsNotExist'));
      }

      listPermission({ _id: { $in: doc.permissions.constructor === Array ? doc.permissions : [] } }, page, pageSize, sortFields, fieldsNeed, (err, docs) => cb && cb(err, docs));
    });
  } else {
    const query = {};
    if (status) {
      query.status = status;
    }
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    listPermission(query, page, pageSize, sortFields, fieldsNeed, (err, docs) => cb && cb(err, docs));
  }
};

service.enablePermission = function enablePermission(info, cb) {
  let paths = info.paths || '';
  const status = info.status;

  const struct = {
    status: { type: 'string', validation(v) { return permissionInfo.validateStatus(v); } },
    paths: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  paths = paths.split(',');
  if (paths.indexOf('all') !== -1) {
    return cb && cb(i18n.t('canNotDisableAllPermission'));
  }

  permissionInfo.collection.updateMany({ path: { $in: paths } }, { $set: { status } }, (err) => {
    if (err) {
      return cb && cb(err);
    }

    service.clearRedisCacheByPermissions(paths, () => cb && cb(null, 'ok'));
  });
};

service.getRoleOwners = function getRoleOwners(info, cb) {
  const _id = info._id || '';
  const keyword = info.keyword || '';
  const limit = info.limit || 20;
  const query = {};

  const getUserInfos = function getUserInfos(userIds, callback) {
    if (!userIds || userIds.length === 0) {
      return callback && callback(null, []);
    }
    const query = { _id: { $in: userIds } };
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    userInfo.collection.find(query, { fields: { name: 1, photo: 1 } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      const rs = [];
      for (let i = 0; i < docs.length; i++) {
        docs[i].type = AssignPermission.TYPE.USER;
        rs.push(docs[i]);
      }

      return callback && callback(null, rs);
    });
  };

  const getGroupInfos = function getGroupInfos(groupIds, callback) {
    if (!groupIds || groupIds.length === 0) {
      return callback && callback(null, []);
    }
    const query = { _id: { $in: groupIds } };
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    groupInfo.collection.find(query, { fields: { name: 1, logo: 1, type: 1 } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      const rs = [];
      for (let i = 0; i < docs.length; i++) {
        const type = docs[i].type;
        if (type === GroupInfo.TYPE.COMPANY) {
          docs[i].type = AssignPermission.TYPE.COMPANY;
        } else if (type === GroupInfo.TYPE.DEPARTMENT) {
          docs[i].type = AssignPermission.TYPE.DEPARTMENT;
        } else if (type === GroupInfo.TYPE.TEAM) {
          docs[i].type = AssignPermission.TYPE.TEAM;
        }
        rs.push(docs[i]);
      }

      return callback && callback(null, rs);
    });
  };

  if (!_id) {
    return cb & cb(i18n.t('getRoleOwnersNoId'));
  }

  query.roles = _id;

  assignPermission.collection.find(query, { fields: { _id: 1, type: 1 } }).limit(limit).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(null, []);
    }

    const userIds = [];
    const groupIds = [];
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].type === AssignPermission.TYPE.USER) {
        userIds.push(docs[i]._id);
      } else {
        groupIds.push(docs[i]._id);
      }
    }

    let result = [];
    getUserInfos(userIds, (err, rs) => {
      if (err) {
        return cb && cb(err);
      }
      result = result.concat(rs);
      getGroupInfos(groupIds, (err, rs) => {
        if (err) {
          return cb && cb(err);
        }
        result = result.concat(rs);
        return cb && cb(null, result);
      });
    });
  });
};

service.deleteOwnerRole = function deleteOwnerRole(info, cb) {
  const _id = info._id;
  let roles = info.roles;
  roles = roles.split(',');
  info.roles = roles;

  if (!_id) {
    return cb & cb(i18n.t('deleteRoleOwnersNoId'));
  }

  if (!roles) {
    return cb & cb(i18n.t('deleteRoleOwnersNoRoles'));
  }

  assignPermission.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('canNotFindRoleAssign'));
    }

    roles = utils.minusArray(doc.roles, roles);

    assignPermission.collection.updateOne({ _id }, { $set: { roles, modifyTime: new Date() } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      service.clearRedisCache(_id, () => cb && cb(null, 'ok'));
    });
  });
};

service.updateRolePermission = function updateRoleAddPermission(info, isAdd, cb) {
  const _id = info._id;
  const allowedPermissions = info.allowedPermissions || [];
  const deniedPermissions = info.deniedPermissions || [];

  if (!_id) {
    return cb & cb(i18n.t('updateRoleNoId'));
  }

  if (deniedPermissions.length === 0 && allowedPermissions.length === 0) {
    return cb & cb(null);
  }

  roleInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('canNotFindRole'));
    }

    let func = utils.minusArr;

    if (isAdd) {
      func = utils.hardMerge;
    }

    doc.allowedPermissions = func(doc.allowedPermissions, allowedPermissions);
    doc.deniedPermissions = func(doc.deniedPermissions, deniedPermissions);

    roleInfo.collection.updateOne({ _id }, { $set: doc }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      service.clearRedisCacheByRoles(_id, () => cb && cb(null, 'ok'));
    });
  });
};

service.searchUserOrGroup = function searchUserOrGroup(info, cb) {
  const type = info.type;
  const keyword = info.keyword || '';
  const limit = info.limit || 10;
  const query = {};

  if (type !== '0' && type !== '1') {
    return cb && cb(i18n.t('searchUserOrGroupTypeNotCorrect'));
  }

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  const searchUser = function searchUser(query) {
    userInfo.collection.find(query, { fields: { name: 1, photo: 1 } }).limit(limit).toArray((err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, docs);
    });
  };

  const searchGroup = function searchGroup(query) {
    groupInfo.collection.find(query, { fields: { name: 1, logo: 1 } }).limit(limit).toArray((err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, docs);
    });
  };

  if (type === '0') {
    searchUser(query);
  } else {
    searchGroup(query);
  }
};

module.exports = service;
