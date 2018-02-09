/**
 * Created by chaoningx on 17/10/26.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class VersionInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'help_VersionInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require' },
      name: { type: 'string', validation: 'require' },
      version: { type: 'string' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      content: { type: 'array' }, // 这部分是总结出来的，比如说，改进了什么，添加了什么功能，可读性的内容
      updateList: { type: 'array' }, // 更新列表，記錄更新了什麼東西,这里边的内容与gitlab中的issue是相同的
      status: { type: 'string', default: VersionInfo.STATUS.UPLOAD, validation: v => utils.isValueInObject(v, VersionInfo.STATUS) },
      packagePath: { type: 'string', validation: 'require' },
      extractPath: { type: 'string' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      logs: { type: 'array' },
      detail: { type: 'object' },
    };
  }
}

VersionInfo.STATUS = {
  UPLOAD: '0',
  UNZIP: '1',
  TRANSFER: '2',
  RESTART: '3',
  SUCCESS: '4',
  ERROR: '1000',
};

module.exports = VersionInfo;
