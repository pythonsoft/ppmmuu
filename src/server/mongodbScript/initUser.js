
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

userInfo.collection.findOne({
  _id: 'xuyawen@phoenixtv.com',
}, { fields: { _id: 1 } }, (err, doc) => {
  if (err) {
    console.log(err.message);
    return;
  }

  if (doc) {
    console.log('user(xuyawen) has been add.');
    return;
  }

  userInfo.collection.insertOne(userInfo.assign({
    _id: email,
    name: 'xuyawen',
    status: 0,
    password: utils.cipher('123123', config.KEY),
    createdAt: new Date(),
  }), (err) => {
    if (err) {
      console.log('add user error ', err.message);
      return;
    }

    console.log('user(xuyawen) has been add.');
  });
});


const set = { allowedPermissions: ['all'], _id: 'admin', name: 'admin' };
roleInfo.collection.remove({ name: 'admin' }, (err) => {
  if (err) {
    throw new Error(`admin role初始化有问题:${err.message}`);
  }
  roleInfo.collection.insertOne(set, (err) => {
    if (err) {
      throw new Error(`admin role初始化有问题:${err.message}`);
    }
    const info = {
      _id: email,
      roles: ['admin'],
    };

    assignPermission.collection.findOneAndUpdate(
      { _id: email }, { $set: assignPermission.assign(info) }, { upsert: true }, (err) => {
        if (err) {
          throw new Error(`assignPermission初始化有问题:${err.message}`);
        }
      });
  });
});

