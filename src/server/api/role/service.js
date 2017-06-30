/**
 * Created by steven on 2017/6/20.
 */
const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const UserInfo = require('../user/userInfo');
const userInfo = new UserInfo();

const RoleInfo = require('./roleInfo');
const roleInfo = new RoleInfo();

const PermissionInfo = require('./permissionInfo');
const permissionInfo = new PermissionInfo();

const config =  require('../../config');
const redisClient = config.redisClient;

let service = {};

/* role */
service.listRole = function(page, pageSize, cb) {
  roleInfo.pagination({}, page, pageSize, function(err, docs) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, docs);
  });
};

service.getRoleDetail = function(id, cb) {
  if(!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  roleInfo.collection.findOne({ _id: id}, function(err, doc){
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, doc);
  });
};

service.addRole = function(_roleInfo = {}, cb) {
  if(!_roleInfo.name){
    return cb && cb(i18n.t('addRoleNoName'));
  }

  if(!_roleInfo.permissions) {
    return cb && cb(i18n.t('addRoleNoPermissions'));
  }

  _roleInfo._id = _roleInfo._id || uuid.v1();
  _roleInfo.permissions = _roleInfo.permissions.indexOf(',') !== -1 ?utils.trim(_roleInfo.permissions.split(',')) : [];

  roleInfo.collection.findOne({ name: _roleInfo.name }, { fields: { _id: 1} }, function(err, doc) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(doc) {
      return cb && cb(i18n.t('addRoleNameIsExist'));
    }

    roleInfo.collection.insertOne(roleInfo.assign(_roleInfo), function(err, r) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      cb && cb(null, r);
    });

  });
};

service.updateRole = function(id, _roleInfo, cb) {
  if(!id) {
    return cb && cb(i18n.t('updateRoleNoId'));
  }

  const updateDoc = roleInfo.updateAssign(_roleInfo);
  updateDoc.permissions = updateDoc.permissions.indexOf(',') !== -1 ? utils.trim(updateDoc.permissions.split(',')) : [];

  roleInfo.collection.findOne({ _id: {$ne: id}, name: _roleInfo.name }, { fields: { _id: 1} }, function(err, doc) {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if(doc){
      return cb && cb(i18n.t('updateRoleNameIsAlreadyExist'));
    }

    roleInfo.collection.updateOne({_id: id}, {$set: updateDoc}, function (err, r) {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      cb && cb(null, r);
    });
  })
};

service.deleteRoles = function(ids, cb) {
  if(!ids) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, function(err, r) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, r);
  });
};

service.assignUserRole = function(userIds, roles, cb) {
  if(!userIds) {
    return cb && cb(i18n.t('assignRoleNoUserIds'));
  }

  userIds = userIds.split(',');
  roles = roles.split(',');
  userInfo.collection.updateMany({ _id: {$in: userIds} }, { $set: { roles: roles } }, function(err, r) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    redisClient.del(userIds);
    cb && cb(null, r);
  });
};

/* permission */
service.getPermissions = function(query, cb) {
  roleInfo.collection.find(query).toArray(function(err, docs) {

    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    let permissions = [];

    docs.forEach(function(item){
      permissions = permissions.concat(item.permissions);
    });

    return cb && cb(null, permissions);
  });
};

const listPermission = function(q, page, pageSize, sortFields, fieldsNeed, cb) {
  permissionInfo.pagination(q, page, pageSize, function(err, docs) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, docs);

  }, sortFields, fieldsNeed);
};

service.listPermission = function(roleId, page, pageSize, sortFields, fieldsNeed, cb) {
  if(roleId) {
    roleInfo.collection.findOne({ _id: roleId }, { fields: { permissions: 1 } }, function(err, doc) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if(!doc) {
        return cb && cb(i18n.t('roleInfoIsNotExist'))
      }

      listPermission({ _id: { $in: doc.permissions.constructor === Array ? doc.permissions : [] } }, page, pageSize, sortFields, fieldsNeed, function(err, docs) {
        cb && cb(err, docs);
      });

    });
  }else {
    listPermission({}, page, pageSize, sortFields, fieldsNeed, function(err, docs) {
      cb && cb(err, docs);
    });
  }
};

service.assignUserPermission = function(userIds, permissions, cb){
  if(!userIds) {
    return cb && cb(i18n.t('assignPermissionNoUserIds'));
  }

  userIds = userIds.split(',');
  permissions = permissions.split(',');
  userInfo.collection.updateMany({ _id: {$in: userIds} }, { $set: { permissions: permissions } }, function(err, r) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    redisClient.del(userIds);
    cb && cb(null, r);
  });
}

module.exports = service;
