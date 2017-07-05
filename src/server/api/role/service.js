/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const AssignPermission = require('./permissionAssignmentInfo');

const assignPermission = new AssignPermission();

const RoleInfo = require('./roleInfo');

const roleInfo = new RoleInfo();

const PermissionInfo = require('./permissionInfo');

const permissionInfo = new PermissionInfo();

const config = require('../../config');

const redisClient = config.redisClient;

const groupService = require('../group/service');

const service = {};

/* role */
service.listRole = function listRole(page, pageSize, cb) {
  roleInfo.pagination({}, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getRoleDetail = function getRoleDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  roleInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.addRole = function addRole(_roleInfo = {}, cb) {
  if (!_roleInfo.name) {
    return cb && cb(i18n.t('addRoleNoName'));
  }

  _roleInfo._id = _roleInfo._id || uuid.v1();
  _roleInfo.allowedPermissions = _roleInfo.allowedPermissions || '';
  _roleInfo.deniedPermissions = _roleInfo.deniedPermissions || '';
  _roleInfo.allowedPermissions = utils.trim(_roleInfo.allowedPermissions.split(','));
  _roleInfo.deniedPermissions = utils.trim(_roleInfo.deniedPermissions.split(','));

  roleInfo.collection.findOne({ name: _roleInfo.name }, { fields: { _id: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('addRoleNameIsExist'));
    }

    roleInfo.collection.insertOne(roleInfo.assign(_roleInfo), (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.updateRole = function updateRole(id, _roleInfo, cb) {
  if (!id) {
    return cb && cb(i18n.t('updateRoleNoId'));
  }

  const updateDoc = roleInfo.updateAssign(_roleInfo);
  updateDoc.allowedPermissions = updateDoc.allowedPermissions || '';
  updateDoc.deniedPermissions = updateDoc.deniedPermissions || '';

  updateDoc.allowedPermissions = utils.trim(updateDoc.allowedPermissions.split(','));
  updateDoc.deniedPermissions = utils.trim(updateDoc.deniedPermissions.split(','));

  roleInfo.collection.findOne({ _id: { $ne: id }, name: _roleInfo.name }, { fields: { _id: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (doc) {
      return cb && cb(i18n.t('updateRoleNameIsAlreadyExist'));
    }

    roleInfo.collection.updateOne({ _id: id }, { $set: updateDoc }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.deleteRoles = function deleteRoles(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.assignRole = function assignRole(updateDoc, cb) {
  const _id = updateDoc._id;
  if (!_id) {
    return cb && cb(i18n.t('assignRoleNoId'));
  }

  updateDoc = assignPermission.updateAssign(updateDoc);

  updateDoc.roles = updateDoc.roles || '';
  updateDoc.allowedPermissions = updateDoc.allowedPermissions || '';
  updateDoc.deniedPermissions = updateDoc.deniedPermissions || '';

  updateDoc.roles = utils.trim(updateDoc.roles.split(','));
  updateDoc.allowedPermissions = utils.trim(updateDoc.allowedPermissions.split(','));
  updateDoc.deniedPermissions = utils.trim(updateDoc.deniedPermissions.split(','));

  assignPermission.collection.updateOne({ _id }, { $set: updateDoc }, { upsert: true }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    redisClient.del(_id);
    return cb && cb(null, r);
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

service.listPermission = function lPermission(roleId, page, pageSize, sortFields, fieldsNeed, cb) {
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
    listPermission({}, page, pageSize, sortFields, fieldsNeed, (err, docs) => cb && cb(err, docs));
  }
};

const getRoles = function getRoles(roles, cb) {
  if (roles) {
    roleInfo.collection.find({ _id: { $in: roles } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(err, docs);
    });
  } else {
    return cb && cb(null, []);
  }
};

service.getUserOrDepartmentRoleAndPermissions = function getUserOrDepartmentRoleAndPermissions(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('getUserOrDepartmentRoleAndPermissionsNoId'));
  }

  assignPermission.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    getRoles(doc.roles, (err, roles) => {
      if (err) {
        return cb && cb(err);
      }

      doc.roles = roles;
      return cb && cb(err, doc);
    });
  });
};

const getAssignPermission = function getAssignPermission(_id, cb) {
  const getRolesPermissions = function getRolesPermissions(roles, cb) {
    if (roles && roles.length) {
      roleInfo.collection.find({ _id: { $in: roles } }).toArray((err, docs) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(err, docs);
      });
    } else {
      return cb && cb(null, []);
    }
  };

  assignPermission.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null);
    }

    const roles = doc.roles || [];
    getRolesPermissions(roles, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      for (let i = 0; i < docs.length; i++) {
        doc.allowedPermissions = doc.allowedPermissions.concat(docs[i].allowedPermissions || []);
        doc.deniedPermissions = doc.deniedPermissions.concat(docs[i].deniedPermissions || []);
      }

      return cb && cb(err, doc);
    });
  });
};

const getAssignPermissionByIds = function getAssignPermissionByIds(ids, cb) {
  const assignPermissionArr = [];

  const loopGetAssignPermission = function loopGetAssignPermission(index) {
    if (index > ids.length - 1) {
      return cb && cb(null, assignPermissionArr);
    }
    getAssignPermission(ids[index], (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      if (doc) {
        assignPermissionArr.push(doc);
      }

      loopGetAssignPermission(index + 1);
    });
  };

  loopGetAssignPermission(0);
};

/* permission */
service.getAllPermissions = function getAllPermissions(userInfo, cb) {
  const team = userInfo.team || '';
  const department = userInfo.department || '';
  const groupId = team._id || department._id || '';
  const assignPermissionIds = [];

  assignPermissionIds.push(userInfo._id);

  const getAssignPermissionIds = function getAssignPermissionIds(groupId, assignPermissionIds, cb) {
    if (!groupId) {
      return cb && cb(null, assignPermissionIds);
    }

    groupService.getGroup(groupId, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }
      if (!doc) {
        return cb && cb(null, assignPermissionIds);
      }

      assignPermissionIds.push(doc._id);
      groupService.listAllParentGroup(doc.parentId, '', (err, docs) => {
        if (err) {
          return cb && cb(err);
        }

        for (let i = 0; i < docs.length; i++) {
          assignPermissionIds.push(docs[i]._id);
        }
        return cb && cb(null, assignPermissionIds);
      });
    });
  };

  const getAllowedPermissions = function getAllowedPermissions(docs) {
    const length = docs.length;
    let allowed = [];

    const filterPermission = function filterPermission(allowed, denied) {
      const result = [];
      for (let i = 0; i < allowed.length; i++) {
        if (denied.indexOf(allowed[i]) === -1) {
          result.push(allowed[i]);
        }
      }
      return result;
    };


    for (let i = length - 1; i >= 0; i--) {
      let denied = docs[i].deniedPermissions || [];
      for (let j = i; j >= 0; j--) {
        const tempDenied = docs[j].deniedPermissions || [];
        denied = denied.concat(tempDenied);
      }
      allowed = allowed.concat(filterPermission(docs[i].allowedPermissions, denied));
    }
    return allowed;
  };

  getAssignPermissionIds(groupId, assignPermissionIds, (err, assignPermissionIds) => {
    if (err) {
      return cb && cb(err);
    }

    getAssignPermissionByIds(assignPermissionIds, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      const allowedPermissions = getAllowedPermissions(docs);
      const result = {
        allowedPermissions,
        unActivePermissions: [],
      };

      permissionInfo.collection.find({ path: { $in: allowedPermissions }, status: PermissionInfo.STATUS.UNACTIVE }).toArray((err, docs) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        docs.forEach((item) => {
          result.unActivePermissions.push(item.path);
        });
        return cb && cb(null, result);
      });
    });
  });
};

module.exports = service;
