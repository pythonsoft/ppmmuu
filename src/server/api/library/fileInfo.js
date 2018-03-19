/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class FileInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'Library_FileInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      objectId: { type: 'string', validation: 'require' },
      jobId: { type: 'string' },
      name: { type: 'string', validation: 'require' },
      size: { type: 'number', validation: 'require' },
      realPath: { type: 'string', validation: 'require' },
      path: { type: 'string', validation: 'require' },
      type: { type: 'string', validation: 'require', default: () => FileInfo.TYPE.HIGH_VIDEO },
      available: { type: 'string', default: () => FileInfo.AVAILABLE.NO },
      status: { type: 'string', validation: 'require', default: () => FileInfo.STATUS.UNKNOW },
      description: { type: 'string' },
      archivePath: { type: 'string' },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      fromWhere: { type: 'string', default: 'HK_RUKU' },
    };
  }
}


FileInfo.TYPE = {
  HIGH_VIDEO: '0', // 高码流
  LOW_BIT_VIDEO: '1', // 低码流
  SUBTITLE: '2', // 字幕
  THUMB: '3', // 缩略图
  DOC: '4',  // 文档
  OTHER: '5', // 其它
  P1080: '6', // 1080P
  P360: '7', // 360P
  AUDIO: '8', // 音频
};

FileInfo.TYPE_MAP = {
  0: '高码流', // 高码流
  1: '低码流', // 低码流
  2: '字幕', // 字幕d
  3: '缩略图', // 缩略图
  4: '文档', // 文档
  5: '其他', // 其他
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
