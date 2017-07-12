
'use strict';

const config = require('../config');
const utils = require('../common/utils');
const UserInfo = require('../api/user/userInfo');

const userInfo = new UserInfo();
const RoleInfo = require('../api/role/roleInfo');

const roleInfo = new RoleInfo();
const AssignPermission = require('../api/role/permissionAssignmentInfo');

const assignPermission = new AssignPermission();

const email = 'xuyawen@phoenixtv.com';


const user =  {
  _id: email,
  name: 'xuyawen',
  status: 0,
  password: utils.cipher('123123', config.KEY),
  createdAt: new Date(),
};

userInfo.insertOne(user, function(err){
  if(err){
    console.log(err);
  }
  
});


const role = { allowedPermissions: ['all'], _id: 'admin', name: 'admin' };
roleInfo.insertOne(role, function(err){
  if(err){
    console.log(err);
  }
  const info = {
    _id: email,
    roles: ['admin'],
  };
  assignPermission.insertOne(info, function(err){
    if(err){
      console.log(err);
    }
  })
})

