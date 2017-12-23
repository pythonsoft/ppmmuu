/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class AttachmentInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ManuscriptAttachmentInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      manuscriptId: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },
      fileInfo: {
        type: 'object',
      },
      progress: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      speed: {
        type: 'string',
      },
      creator: { type: 'object', default: { _id: '', name: '' } },
      status: { type: 'string', default: AttachmentInfo.STATUS.COMPLETED, validation: v => utils.isValueInObject(v, AttachmentInfo.STATUS) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
    };
  }

}

AttachmentInfo.STATUS = {
  PREPARE: '1',   // 准备上传
  UPLOADING: '2', // 正在上传
  STOPPING: '3',  // 暂停中
  COMPLETED: '4', // 完成
  ERROR: '5',      // 上传出错
};

module.exports = AttachmentInfo;
