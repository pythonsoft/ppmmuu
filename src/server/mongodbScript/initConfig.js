
'use strict';

const ConfigGroup = require('../api/configuration/configurationGroupInfo');

const configGroup = new ConfigGroup();
const ConfigInfo = require('../api/configuration/configurationInfo');

const configInfo = new ConfigInfo();

configGroup.collection.findOne({ name: '媒体库搜索配置' }, { fields: { name: 1 } }, (err, doc) => {
  if (err) {
    console.log(err);
    return false;
  }

  if (doc) {
    console.log('init config info success!');
    return false;
  }

  configGroup.insertOne({ name: '媒体库搜索配置' }, (err) => {
    if (err) {
      console.log(err);
    }

    configGroup.collection.findOne({ name: '媒体库搜索配置' }, (err, doc) => {
      if (err) {
        console.log(err);
      }

      if (!doc) {
        console.log('没有创建媒体库搜索配置组');
      } else {
        const genre = doc._id;
        const info = [
          {
            key: 'category',
            value: '宣傳,素材,廣告',
            description: '',
            genre,
          },
          {
            key: 'duration',
            value: '不限,30分钟之内,1小时之内,2小时之内,3小时之内,6小时之内',
            description: '',
            genre,
          },
        ];
        configInfo.insertMany(info, (err) => {
          if (err) {
            throw new Error(`创建媒体库搜索配置出错:${err.message}`);
          }
          return true;
        });
      }
    });
  });
});

