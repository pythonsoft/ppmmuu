
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

const user = {
  email,
  phone: '13578988788',
  name: 'xuyawen',
  status: '0',
  password: utils.cipher('123123', config.KEY),
  expiredTime: new Date('9999 23:59:59'),
  createdAt: new Date(),
};

userInfo.collection.dropIndex('phone_1');

userInfo.collection.update({ expiredTime: { $exists: false } }, { $set: { expiredTime: new Date('9999 23:59:59') } }, { multi: true }, (err) => {
  if (err) {
    console.log(err.message);
  }
});

userInfo.collection.findOne({ email }, { fields: { email: 1 } }, (err, doc) => {
  if (err) {
    console.log(err);
    return false;
  }

  if (doc) {
    console.log('init user info success!');
    return false;
  }

  userInfo.insertOne(user, (err) => {
    if (err) {
      console.log(err);
    }

    userInfo.collection.findOne({ email }, (err, doc) => {
      if (err) {
        console.log(err);
      }

      if (!doc) {
        console.log('没有创建初始账户');
      } else {
        const userId = doc._id;
        const role = { allowedPermissions: ['all'], _id: 'admin', name: 'admin' };

        roleInfo.insertOne(role, (err) => {
          if (err) {
            console.log(err);
          }
          const info = {
            _id: userId,
            type: AssignPermission.TYPE.USER,
            roles: ['admin'],
          };
          assignPermission.insertOne(info, (err) => {
            if (err) {
              console.log(err);
            }
          });
        });
      }
    });
  });
});

