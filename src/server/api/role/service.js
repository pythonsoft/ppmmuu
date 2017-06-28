/**
 * Created by steven on 2017/6/20.
 */
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const RoleInfo = require('./roleInfo');
const roleInfo = new RoleInfo();

let service = {};

/* role */
service.listRole = function(page, pageSize, cb) {
  roleInfo.pagination({}, page || 1, pageSize * 1 || 30, function(err, docs) {
    if(err) {
      //TODO add log4j record
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, docs);
  });
};

service.getRoleDetail = function(id, cb) {
  if(!id) {
    return cb && cb(i18n.t('getRoleNoId'));
  }

  roleInfo.collection.findOne({ _id: _id}, function(err, doc){
    if(err) {
      //TODO add log4j record
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
  _roleInfo.permission = _roleInfo.permission.indexOf(',') !== -1 ?utils.trim(_roleInfo.permission.split(',')) : [];

  roleInfo.collection.findOne({ name: name }, { fields: { _id: 1} }, function(err, doc) {
    if(err) {
      //TODO add log4j record
      return cb && cb(i18n.t('databaseError'));
    }

    if(doc) {
      return cb && cb(i18n.t('addRoleNameIsExist'));
    }

    roleInfo.collection.insertOne(roleInfo.assign(_roleInfo), function(err, r) {
      if(err) {
        //TODO add log4j record
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
  updateDoc.permission = updateDoc.permission.indexOf(',') !== -1 ? utils.trim(updateDoc.permission.split(',')) : [];

  roleInfo.collection.updateOne({ _id: id }, { $set: updateDoc }, function(err, r) {
    if(err) {
      //TODO add log4j record
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, r);
  });
};

service.deleteRoles = function(ids, cb) {
  if(!ids) {
    return cb && cb(i18n.t('deleteRoleNoIds'));
  }

  roleInfo.collection.removeMany({ _id: { $in: ids.split(',') } }, function(err, r) {
    if(err) {
      //TODO add log4j record
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, r);
  });
};

/* permission */
service.getPermissions = function(query, cb) {
  roleInfo.collection.find(query).toArray(function(err, docs) {

    if(err) {
      //TODO add log4j record
      return cb && cb(i18n.t('databaseError'));
    }

    let permissions = [];

    docs.forEach(function(item){
      permissions = permissions.concat(item.permissions);
    });

    return cb && cb(null, permissions);
  });
};

service.listPermission = function(cb) {

};

module.exports = service;
