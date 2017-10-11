/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   SubscribeInfo:
 *     required:
 *       - companyName
 *     properties:
 *       companyName:
 *         type: string
 */
class SubscribeInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'SubscribeInfo');

    this.struct = {
      _id: { type: 'string', allowUpdate: false, validation: 'require' },  // companyId
      companyName: { type: 'string', validation: 'require', allowUpdate: false },
      subscribeType: { type: 'array', validation: 'require' },         // 订阅类型
      downloadSeconds: { type: 'number', validation: 'require' },       // 下载时长,单位秒
      usedDownloadSeconds: { type: 'number', default: 0 },              // 已用下载时长，单位秒
      remainDownloadSeconds: { type: 'number', validation: 'require' },  // 剩余下载时长，单位秒
      periodOfUse: { type: 'number', validation: 'require' },
      startTime: { type: 'date', validation: 'require' },
      expiredTime: { type: 'date', validation: 'require' },
      lastEditor: { type: 'object', default: { _id: '', name: '' } },   // 最后修改人
      creator: { type: 'object', default: { _id: '', name: '' } },  // 创建人
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
    };
  }
}

SubscribeInfo.SUBSCRIBE_TYPE = {
  POLITIC: '0',
  SPORT: '1',
  ENTERTAINMENT: '2',
};

SubscribeInfo.DOWNLOAD_TYPE = {
  PUSHED: '1', // 推送
  DIRECT_DOWNLOAD: '2', //直接下载
};

SubscribeInfo.STATUS = {
  UNUSED: '0',
  USING: '1',
  EXPIRED: '2',
};

module.exports = SubscribeInfo;
