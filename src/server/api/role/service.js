/**
 * Created by steven on 2017/6/20.
 */
const RoleInfo = require('./roleInfo');
const roleInfo = new RoleInfo();
const Utils = require('../../common/utils');
const config = require('../../config');
let service = {};

service.getPermissions = function(query, cb){
  roleInfo.collection.find(query).toArray(function(err, docs){
    if(err){
      return cb && cb(Utils.err("-1", err.message));
    }
    let permissions = [];
    docs.forEach(function(item){
      permissions = permissions.concat(item.permissions);
    })
    return cb && cb(null, permissions);
  })
}

module.exports = service;