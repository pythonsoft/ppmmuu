const config = require('../config');
const UserInfo = require('../api/user/userInfo');

const userInfo = new UserInfo();

const request = require('request');

const TICKET = '8649e68b4adc426b6d8eda111be86f446b66d0f6b89f40334ef5fb6ad1b567c51b9897f916f5e54eaf3d1c97c570923a7acac0ad056baa01bbc5ae0115b6879d';

userInfo.collection.find({}).toArray((err, docs) => {
  if (err) {
    console.log('collections error -->', err);
    return false;
  }

  for (let i = 0, len = docs.length; i < len; i++) {
    request.post({ url: 'http://localhost:9000/im/sync',
      form: {
        'im-ticket': TICKET,
        key: 'ump',
        id: docs[i]._id,
        name: docs[i].name,
        photo: docs[i].photo,
        email: docs[i].email,
      } }, (err, res, body) => {
      if (err) {
        console.error(err);
        return false;
      }

      console.log('add success user id: ', docs[i].name, body);

      return false;
    });
  }
});

