/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');

const i18n = require('i18next');

const AssignPermission = require('./permissionAssignmentInfo');

const assignPermission = new AssignPermission();

const RoleInfo = require('./roleInfo');

const roleInfo = new RoleInfo();

const PermissionInfo = require('./permissionInfo');

const permissionInfo = new PermissionInfo();

const groupService = require('../group/service');

const service = {};

/* role */
service.listRole = function listRole(page, pageSize, keyword, cb) {
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
  });
};

service.getRoleDetail = function getRoleDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  const getPermissions = function getPermissions(arr, callback){
    if(!arr || arr.length === 0){
      return callback && callback(null, []);
    }
    permissionInfo.collection.find({path : {$in:  arr}}).toArray(function(err, docs){
      if(err){
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    })
  }

  roleInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(!doc){
      return cb && cb(i18n.t('canNotFindRole'));
    }

    const allowedPermissions = doc.allowedPermissions || [];
    const deniedPermissions = doc.deniedPermissions || [];

    getPermissions(allowedPermissions, function(err, docs){
      if(err){
        return cb && cb(err);
      }
      doc.allowedPermissions = docs;

      getPermissions(allowedPermissions, function(err, docs) {
        if (err) {
          return cb && cb(err);
        }

        doc.deniedPermissions = docs;

        return cb && cb(null, doc);
      });
    })
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

service.updateRole = function updateRole(_roleInfo, cb) {
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

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.assignRole = function assignRole(updateDoc, cb) {
  assignPermission.udpateOne({ _id: updateDoc._id }, updateDoc, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, doc);
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

service.enablePermission = function enablePermission(info, cb) {
  let _ids = info._ids || '';
  const status = info.status;

  if (!_ids) {
    return cb && cb(i18n.t('enablePermissionNoIds'));
  }

  if (!permissionInfo.validateStatus(status)) {
    return cb && cb(i18n.t('enablePermissionStatusNotCorrect'));
  }

  _ids = _ids.split(',');
  permissionInfo.collection.updateMany({ _id: { $in: _ids } }, { $set: { status } }, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, {});
  });
};

module.exports = service;
