'use strict';

const channelService = require('../api/connection/service');
const ChannelInfo = require('../api/connection/channelInfo');
const AnchorInfo = require('../api/connection/anchorInfo');
const UserInfo = require('../api/user/userInfo');

const channelInfo = new ChannelInfo();
const anchorInfo = new AnchorInfo();
const userInfo = new UserInfo();

const uuid = require('uuid');

const total = 5;
const infos = [];
for (let i = 1; i <= total; i++) {
  const item = {
    _id: uuid.v1(),
    name: `通道${i}`,
  };
  infos.push(item);
}

channelInfo.collection.findOne({}, (err, doc) => {
  if (!doc) {
    channelService.createChannels(infos, (err) => {
      if (err) {
        console.log('初始化通道出错===>', err.mesage);
        return;
      }
      console.log('初始化通道成功!');
      // setInterval(()=>{ dealAnchor()}, 6000);
    });
  }
});

const dealAnchor = () => {
  userInfo.collection.findOne({ name: 'xuyawen' }, (err, user) => {
    channelInfo.collection.findOne({}, (err, doc) => {
      const channelId = doc._id;
      anchorInfo.collection.findOne({ status: AnchorInfo.STATUS.CONNECTING }, (err, doc) => {
        const anchorId = doc ? doc._id : '';
        if (anchorId) {
          const info = {
            anchorId,
            channelId,
            acceptUser: {
              _id: user._id,
              name: user.name,
            },
          };
          channelService.assignChannel(info, (err) => {
            if (err) {
              console.log(err.message);
            }
          });
        }
      });
    });
  });
};
