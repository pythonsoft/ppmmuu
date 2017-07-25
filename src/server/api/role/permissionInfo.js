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
 *       creator:
 *         type: object
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       status:
 *         type: string
 *       detail:
 *         type: object
 */
class PermissionInfo extends DB {
  constructor() {
    const indexes = [
      { key: { name: 1 }, name: 'permission_name', unique: true },
      { key: { path: 1 }, name: 'permission_path', unique: true },
    ];

    super(config.dbInstance.umpDB, 'PermissionInfo', indexes);

    this.struct = {
      _id: { type: 'string', validation: 'require', allowUpdate: false },
      name: { type: 'string', validation: 'require', allowUpdate: false },
      path: { type: 'string', validation: 'require', allowUpdate: false },
      creator: { type: 'object', allowUpdate: false },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
      status: { type: 'string', default: PermissionInfo.STATUS.NORMAL, validation: this.validateStatus },
    };
  }

  validateStatus(status) {
    for (const key in PermissionInfo.STATUS) {
      if (PermissionInfo.STATUS[key] === status) {
        return true;
      }
    }
    return false;
  }
}

PermissionInfo.STATUS = {
  NORMAL: '0',
  UNACTIVE: '1',
};

module.exports = PermissionInfo;
