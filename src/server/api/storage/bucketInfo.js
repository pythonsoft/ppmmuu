/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   StorageInfo:
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
class StorageInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'StorageInfo');

    this.doc = {
      _id: '',
      name: '',
      creator: { _id: '', name: '' },
      status: StorageInfo.STATUS.NORMAL,
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      detail: {},
    };

    this.updateDoc = { name: 1, status: 1, modifyTime: 1, description: 1, detail: 1 };

  }
}

StorageInfo.STATUS = {
  NORMAL: '0',
  HAND_UP: '1'
};

module.exports = StorageInfo;
