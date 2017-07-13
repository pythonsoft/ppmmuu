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
    const indexes = [{ key:{name: 1}, unique: true }, { key:{path: 1}, unique: true }];
    super(config.dbInstance.umpDB, 'PermissionInfo', indexes);

    this.struct = {
      _id: { type: String, default: '', validation: 'require', unique: true},
      name: { type: String, default: '', validation: 'require', unique: true, allowUpdate: false },
      path: { type: String, default: '', validation: 'require', unique: true, allowUpdate: false },
      creator: { type: Object, default: {}, allowUpdate: false },
      createdTime: { type: Date, default() { return new Date(); }, allowUpdate: false },
      modifyTime: { type: Date, default() { return new Date(); }, allowUpdate: true },
      description: { type: String, default: '', allowUpdate: true },
      detail: { type: Object, default: {}, allowUpdate: true },
      status: { type: String, default: PermissionInfo.STATUS.NORMAL, validation: this.validateStatus, allowUpdate: true },
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
