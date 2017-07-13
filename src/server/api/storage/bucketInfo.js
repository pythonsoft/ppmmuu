/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

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
      name: { type: 'string' },
      type: { type: 'string', default: BucketInfo.TYPE.STANDARD, validation: function (v) {

      }},
      permission: BucketInfo.PERMISSION.PUBLIC_READ_WRITE,
      creator: { _id: '', name: '' },
      status: BucketInfo.STATUS.NORMAL,
      createdTime: new Date(),
      modifyTime: new Date(),
      deleteDeny: BucketInfo.DELETE_DENY.YES, // 删除保护，创建后默认为保护状态
      description: '',
      detail: {},
    };

    this.updateDoc = { name: 1, status: 1, modifyTime: 1, description: 1, detail: 1 };
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
