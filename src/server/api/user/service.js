/**
 * Created by steven on 17/5/12.
 */
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const Token = require('../../common/token');
const config = require('../../config');
const groupService = require('../group/service');

const UserInfo = require('./userInfo');
const userInfo = new UserInfo();

const UserPermission = require('./userPermission');
const userPermission = new UserPermission();

const PermissionInfo = require('../role/permissionInfo');
const permissionInfo = new PermissionInfo();

const RoleInfo = require('../role/roleInfo');
const roleInfo = new RoleInfo();

let service = {};

service.login = function(res, username, password, cb){
  const cipherPassword = utils.cipher(password, config.KEY);
  let query = {
    name: username,
    password: cipherPassword
  };

  if(utils.checkEmail(username)) {
    query._id = username;
  }

  userInfo.collection.findOne(query, { fields: { _id: 1 } }, function(err, doc) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(!doc) {
      return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
    }

    const expires = Date.now() + config.cookieExpires;
    const token = Token.create(doc._id, expires, config.KEY);

    res.cookie('ticket', token, {
      expires: new Date(expires),
      httpOnly: true
    });

    return cb && cb(null, {token: token});
  });

};

service.setCookie = function(res, id) {
  const expires = Date.now() + config.cookieExpires;
  const token = Token.create(id, expires, config.KEY);

  res.cookie('ticket', token, {
    expires: new Date(expires),
    httpOnly: true
  });

  return token;
};

const getUserPermission = function(_id, cb){

  const getRolesPermissions = function(roles, cb){
    if(roles && roles.length){

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

  userPermission.collection.findOne({_id: _id}, function(err, doc){
    if(err){
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    let roles = doc.roles || [];
    getRolesPermissions(roles, function(err, docs){
      if(err){
        return cb && cb(err);
      }
      
      for(let i = 0 ; i< docs.length; i++){
        doc.allowedPermissions = doc.allowedPermissions.concat(docs[i].allowedPermissions || []);
        doc.deniedPermissions = doc.deniedPermissions.concat(docs[i].deniedPermissions || []);
      }

      return cb && cb(err, doc);
    })
  })
}

const getUserPermissionByIds = function(ids, cb){
  let userPermissionArr = [];

  const loopGetUserPermission = function(index){
    if(index > ids.length - 1){
      return cb && cb (null, userPermissionArr);
    }
    getUserPermission(ids[index], function(err, doc){
      if(err){
        return cb && cb(err);
      }
 
      if(doc){
        userPermissionArr.push(doc);
      }

      loopGetUserPermission(index+1);
    })
  }

  loopGetUserPermission(0);
}

/* permission */
service.getAllPermissions = function(userInfo, cb) {
  let team = userInfo.team || "";
  let department = userInfo.department || "";
  let groupId = team._id || department._id || "";
  let userPermissionIds = [];

  userPermissionIds.push(userInfo._id);

  const getUserPermissionIds = function(groupId, userPermissionIds, cb){
    if(!groupId){
      return cb && cb(null, userPermissionIds);
    }

    groupService.getGroup(groupId, function(err, doc){
      if(err){
        return cb && cb(err);
      }
      if(!doc){
        return cb && cb(null, userPermissionIds);
      }

      userPermissionIds.push(doc._id);
      groupService.listAllParentGroup(doc.parentId, {}, function(err, docs){
        if(err){
          return cb && cb(err);
        }

        for(let i = 0; i< docs.length; i++){
          userPermissionIds.push(docs[i]._id);
        }
        return cb && cb(null, userPermissionIds);
      })
    })
  }

  const getAllowedPermissions = function(docs){
    let length = docs.length;
    let allowed = [];

    const filterPermission = function(allowed, denied){
      let result = [];
      for(let i = 0; i < allowed.length; i++){
        if(denied.indexOf(allowed[i]) == -1){
          result.push(allowed[i]);
        }
      }
      return result;
    }


    for(let i = length - 1; i >= 0; i--){
      let denied = docs[i].deniedPermissions || [];
      for(let j = i; j >=0; j--){
        let tempDenied = docs[j].deniedPermissions || [];
        denied = denied.concat(tempDenied);
      }
      allowed = allowed.concat(filterPermission(docs[i].allowedPermissions, denied))
    }
   
    return allowed;
  }

  getUserPermissionIds(groupId, userPermissionIds, function(err, userPermissionIds){
    if(err){
      return cb && cb(err);
    }
    

    getUserPermissionByIds(userPermissionIds, function(err, docs){
      if(err){
        return cb && cb(err);
      }

      let allowedPermissions = getAllowedPermissions(docs);
      let result = {
        allowedPermissions: allowedPermissions,
        unActivePermissions: []
      }

      permissionInfo.collection.find({path: {$in: allowedPermissions}, status: PermissionInfo.STATUS.UNACTIVE}).toArray(function(err, docs){
        if(err){
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        docs.forEach(function(item){
          result.unActivePermissions.push(item.path);
        })
        return cb && cb(null, result);
      })
    })
  })
};

module.exports = service;
