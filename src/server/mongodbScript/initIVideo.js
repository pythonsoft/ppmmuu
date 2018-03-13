
'use strict';

const uuid = require('uuid');
const ItemInfo = require('../api/ivideo/itemInfo');

const itemInfo = new ItemInfo();

const initDir = [
  {
    _id: uuid.v1(),
    name: '收录素材',
    creatorId: '',
    creator: {},
    createdTime: new Date(),
    parentId: '',
    type: '0',
    modifyTime: new Date(),
    description: '',
    snippet: {},
    details: {},
    canRemove: '0',
    ownerType: ItemInfo.OWNER_TYPE.SHOULU,
  },
  {
    _id: uuid.v1(),
    name: '新闻素材',
    creatorId: '',
    creator: {},
    createdTime: new Date(),
    parentId: '',
    type: '0',
    modifyTime: new Date(),
    description: '',
    snippet: {},
    details: {},
    canRemove: '0',
    ownerType: ItemInfo.OWNER_TYPE.NEWS,
  },
  {
    _id: uuid.v1(),
    name: '共享素材',
    creatorId: '',
    creator: {},
    createdTime: new Date(),
    parentId: '',
    type: '0',
    modifyTime: new Date(),
    description: '',
    snippet: {},
    details: {},
    canRemove: '0',
    ownerType: ItemInfo.OWNER_TYPE.SHARE,
  },
  {
    _id: uuid.v1(),
    name: '我的素材',
    creatorId: '',
    creator: {},
    createdTime: new Date(),
    parentId: '',
    type: '0',
    modifyTime: new Date(),
    description: '',
    snippet: {},
    details: {},
    canRemove: '0',
    ownerType: ItemInfo.OWNER_TYPE.MINE,
  },
];

itemInfo.collection.findOne({ name: '收录素材', creatorId: '', ownerType: ItemInfo.OWNER_TYPE.SHOULU }, (err, doc) => {
  if (err) {
    console.log('初始化视频编辑目录失败', JSON.stringify(err));
    throw new Error(err);
  }
  if (!doc) {
    itemInfo.collection.insertMany(initDir, (err) => {
      if (err) {
        console.log('初始化视频编辑目录失败', JSON.stringify(err));
        throw new Error(err);
      }
      console.log('初始化视频编辑目录成功!');
    });
  }
});

