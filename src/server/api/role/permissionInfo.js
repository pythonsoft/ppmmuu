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
    super(config.dbInstance.umpDB, 'PermissionInfo');

    this.struct = {
      _id: { type: 'string', default: '', validation: 'require', unique: true },
      name: { type: 'string', default: '', validation: 'require', unique: true },
      path: { type: 'string', default: '', validation: 'require', unique: true },
      creator: { type: 'object', default: {} },
      createdTime: { type: 'date', default: function(){ return new date()}},
      modifyTime: { type: 'string', default: function(){ return new date()}, allowUpdate: true},
      description: { type: 'string', default: '', allowUpdate: true },
      detail: { type: 'object', default: {}, allowUpdate: true },
      status: { type: 'string', default: PermissionInfo.STATUS.NORMAL, validation: this.validateStatus, allowUpdate: true },
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
