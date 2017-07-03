const config = require('../config');
const utils = require('../common/utils');
const uuid =require('uuid');
const UserInfo = require('../api/user/userInfo');
const userInfo = new UserInfo();
const RoleInfo = require('../api/role/roleInfo');
const roleInfo = new RoleInfo();
const UserPermission = require('../api/user/userPermission');
const userPermission = new UserPermission();

let email = "xuyawen@phoenixtv.com";

userInfo.collection.findOne({
  _id: "xuyawen@phoenixtv.com"
}, { fields: { _id: 1 } }, function(err, doc) {
  if(err) {
    console.log(err.message);
    return;
  }

  if(doc) {
    console.log('user(xuyawen) has been add.');
    return;
  }

  userInfo.collection.insertOne(userInfo.assgin({
    "_id" : email,
    "name" : "xuyawen",
    "status" : 0,
    "password" : utils.cipher('123123', config.KEY),
    "createdAt" : new Date()
  }), function(err) {
    if(err) {
      console.log('add user error ', err.message);
      return;
    }

    console.log('user(xuyawen) has been add.');
  });

});


var set = { allowedPermissions: ['all']};
roleInfo.collection.remove({'name': 'admin'}, function(err){
  if(err){
    throw new Error('admin role初始化有问题:' + err.message);
  }
  set.name = 'admin';
  set._id = 'admin';
  roleInfo.collection.insertOne(set, function(err){
    if(err){
      throw new Error('admin role初始化有问题:' + err.message);
    }
    let info ={
      _id: email,
      roles: ['admin']
    }
    userPermission.collection.findOneAndUpdate({_id: email}, {$set: userPermission.assign(info)}, {upsert: true}, function(err){
      if(err){
        throw new Error('userPermission初始化有问题:' + err.message);
      }
    })
  })
})

