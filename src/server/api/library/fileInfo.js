/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class FileInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'Library_FileInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      objectId: { type: 'string', validation: 'require' },
      name: { type: 'string', validation: 'require' },
      size: { type: 'number', validation: 'require' },
      realPath: { type: 'string', validation: 'require' },
      path: { type: 'string', validation: 'require' },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => FileInfo.TYPE.ORIGINAL },
      available: { type: 'string', default: () => FileInfo.AVAILABLE.NO },
      status: { type: 'string', validation: 'require', default: () => FileInfo.STATUS.UNKNOW },
      description: { type: 'string' },
      archivePath: { type: 'string' },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
    };
  }
}

FileInfo.TYPE = {
  ORIGINAL: '0', // 源文件
  LOW_BIT_VIDEO: '1', // 低码流
  SUBTITLE: '2', //字幕
  THUMB: '3', // 缩略图
  OTHER: '4', // 其它
};

FileInfo.AVAILABLE = {
  NO: '0',
  YES: '1',
};

FileInfo.STATUS = {
  UNKNOW: '0',
  ONLINE: '1',
  ONLINE_NEAR: '2',
  NEAR: '3',
  ONLINE_OFFLINE: '4',
  OFFLINE: '5',
};

module.exports = FileInfo;
