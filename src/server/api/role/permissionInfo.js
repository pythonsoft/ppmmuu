/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   PermissionInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       path:
 *         type: string
 */
class PermissionInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'PermissionInfo');

    this.doc = {
      _id: '',
      name: '',
      path: '',
      creator: {},
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      detail: {},
      status: PermissionInfo.STATUS.NORMAL,
    };
  }
}

PermissionInfo.STATUS = {
  NORMAL: '0',
  UNACTIVE: '1',
};

module.exports = PermissionInfo;
