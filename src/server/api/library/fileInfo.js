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
      name: { type: 'string', validation: 'require' },
      size: { type: 'number', validation: 'require' },
      realPath: { type: 'number', validation: 'require' },
      path: { type: 'number', validation: 'require' },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => FileInfo.TYPE.ORIGINAL },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      available: { type: 'string', default: () => FileInfo.AVAILABLE.NO },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },

      archivePath: { type: 'string', validation: 'require' },
      status: { type: 'string', validation: 'require' },
    };
  }
}

FileInfo.TYPE = {
  ORIGINAL: '0',
  LOW_BIT_VIDEO: '1',
  SUBTITLE: '2',
  THUMB: '3', //缩略图
  OTHER: '4',
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
