const config = require('../config');
const utils = require('../common/utils');
const UserInfo = require('../api/user/userInfo');
const userInfo = new UserInfo();

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
    "_id" : "xuyawen@phoenixtv.com",
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

