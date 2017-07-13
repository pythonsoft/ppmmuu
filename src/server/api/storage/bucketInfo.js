/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   BucketInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class BucketInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'BucketInfo');

    this.doc = {
      _id: { type: 'string' },
      name: { type: 'string', validation: 'require' },
      type: { type: 'string', default: BucketInfo.TYPE.STANDARD, validation: (v) => utils.isValueInObject(v, BucketInfo.TYPE) },
      permission: { type: 'string', default: BucketInfo.PERMISSION.PUBLIC_READ_WRITE, validation: (v) => utils.isValueInObject(v, BucketInfo.PERMISSION) },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      status: { type: 'string', default: BucketInfo.STATUS.NORMAL, validation: (v) => utils.isValueInObject(v, BucketInfo.STATUS) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      deleteDeny: { type: 'string', default: BucketInfo.DELETE_DENY.YES, validation: (v) => utils.isValueInObject(v, BucketInfo.DELETE_DENY) }, // 删除保护，创建后默认为保护状态
      description: { type: 'string' },
      detail: { type: 'object' },
    };

  }

}

BucketInfo.STATUS = {
  NORMAL: '0',
  HAND_UP: '1',
};

BucketInfo.PERMISSION = {
  PRIVATE: '0',
  PUBLIC_READ_ONLY: '1',
  PUBLIC_READ_WRITE: '2',
};

BucketInfo.TYPE = {
  STANDARD: '0', // 标准存储
  IA: '1', // 低频存储
  ARCHIVE: '2', // 归档存储
};

BucketInfo.DELETE_DENY = {
  YES: '1',
  NO: '0',
};

module.exports = BucketInfo;
