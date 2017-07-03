/**
 * Created by steven on 2017/6/20.
 */
const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const UserPermission = require('../user/userPermission');
const userPermission = new UserPermission();

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

  _roleInfo._id = _roleInfo._id || uuid.v1();
  _roleInfo.allowedPermissions = _roleInfo.allowedPermissions.indexOf(',') !== -1 ?utils.trim(_roleInfo.allowedPermissions.split(',')) : [];
  _roleInfo.deniedPermissions = _roleInfo.deniedPermissions.indexOf(',') !== -1 ?utils.trim(_roleInfo.deniedPermissions.split(',')) : [];

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
  if(updateDoc.allowedPermissions) {
    updateDoc.allowedPermissions = updateDoc.allowedPermissions.indexOf(',') !== -1 ? utils.trim(updateDoc.allowedPermissions.split(',')) : [];
  }
  if(updateDoc.deniedPermissions) {
    updateDoc.deniedPermissions = updateDoc.deniedPermissions.indexOf(',') !== -1 ? utils.trim(updateDoc.deniedPermissions.split(',')) : [];
  }

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

service.assignRole = function(updateDoc, cb) {
  const _id = updateDoc._id;
  if(!_id) {
    return cb && cb(i18n.t('assignRoleNoId'));
  }

  updateDoc = userPermission.updateAssign(updateDoc);

  updateDoc.roles = updateDoc.roles.indexOf(',') !== -1 ? utils.trim(updateDoc.roles.split(',')) : [];
  updateDoc.allowedPermissions = updateDoc.allowedPermissions.indexOf(',') !== -1 ? utils.trim(updateDoc.allowedPermissions.split(',')) : [];
  updateDoc.deniedPermissions = updateDoc.deniedPermissions.indexOf(',') !== -1 ? utils.trim(updateDoc.deniedPermissions.split(',')) : [];

  userPermission.collection.updateOne({ _id: _id }, { $set: updateDoc }, { upsert: true}, function(err, r) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    redisClient.del(_id);
    cb && cb(null, r);
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

const getRoles = function(roles, cb){
  if(roles){

    roleInfo.collection.find({_id: {$in: roles}}).toArray(function(err, docs) {
      if(err){
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(err, docs)
    })
  }else{

    return cb && cb(null, []);
  }
}

service.getUserOrDepartmentRoleAndPermissions = function(_id, cb){
  if(!_id){
    return cb && cb(i18n.t('getUserOrDepartmentRoleAndPermissionsNoId'));
  }

  userPermission.collection.findOne({_id: _id}, function(err, doc){
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    getRoles(doc.roles, function(err, roles){
      if(err){
        return cb && cb(err)
      }

      doc.roles = roles;
      return cb && cb(err, doc);
    })
  })
}

module.exports = service;
