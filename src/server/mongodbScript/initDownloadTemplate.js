/**
 * Created by steven on 17/9/25.
 */

'use strict';

const UserInfo = require('../api/user/userInfo');
const BucketInfo = require('../api/storage/bucketInfo');
const TemplateGroupInfo = require('../api/template/templateGroupInfo');
const TemplateInfo = require('../api/template/templateInfo');

const userInfo = new UserInfo();
const bucketInfo = new BucketInfo();
const templateGroupInfo = new TemplateGroupInfo();
const templateInfo = new TemplateInfo();

const service = require('../api/template/service');
const storageService = require('../api/storage/service');

const bucket = {
  _id: '下载',
  name: 'media_download',
  type: '0',
  permission: '2',
};

const groupName = '分组1';
templateGroupInfo.collection.findOne({ name: groupName }, (err, doc) => {
  if (err) {
    console.log(err.message);
  } else if (doc) {
    templateInfo.collection.updateMany({ groupId: '' }, { $set: { groupId: doc._id } }, () => {});
  } else {
    service.addGroup({ name: groupName }, (err) => {
      if (err) {
        console.log(err.message);
      } else {
        templateGroupInfo.collection.findOne({ name: groupName }, (err, doc) => {
          if (err) {
            console.log(err.message);
          }
          if (doc) {
            templateInfo.collection.updateMany({ groupId: { $exists: false } }, { $set: { groupId: doc._id } }, () => {});
          }
        });
      }
    });
  }
});

bucketInfo.collection.findOne({ _id: bucket._id }, (err, doc) => {
  if (err) {
    throw new Error(`初始化下载模板失败:${err.message}`);
  }
  if (doc) {
    return;
  }
  storageService.addBucket(bucket, (err) => {
    if (err) {
      console.log(err);
    }
    userInfo.collection.findOne({ email: 'xuyawen@phoenixtv.com' }, (err, doc) => {
      if (err) {
        console.log('error:', err.message);
        return;
      }
      const userId = doc ? doc._id : '';
      const description = '凤云快传下载';
      const script = `let storagePath = [
    year,
    month,
    day
  ].join('\\\\');

  result = '\\\\' + storagePath;`;
      const id = 'MEDIA_EXPRESS';
      const name = '凤云快传下载';
      const bucketId = bucket._id;
      const creatorId = userId;
      service.createDownloadTemplate({ creatorId, id, name, description, bucketId, script, downloadAudit: true }, (err) => {
        if (err) {
          throw new Error(`初始化下载模板失败:${err.message}`);
        }
      });
    });
  });
});

