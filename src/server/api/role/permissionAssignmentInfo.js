/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   PermissionAssignmentInfo:
 *     required:
 *       - roles
 *     properties:
 *       roles:
 *         type: array
 *         items:
 *           type: string
 *       allowedPermissions:
 *         type: array
 *         items:
 *           type: string
 *       deniedPermissions:
 *         type: array
 *         items:
 *           type: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 */
class PermissionAssignmentInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'PermissionAssignmentInfo');

    this.struct = {
      _id: { type: 'string', default: '', validation: 'require', unique: true }, // userId or departmentId or teamId
      roles: { type: 'array', default: [], allowUpdate: true },
      allowedPermissions: { type: 'array', default: [], allowUpdate: true }, // 允许权限
      deniedPermissions: { type: 'array', default: [], allowUpdate: true }, // 拒绝权限
      createdTime: { type: 'date', default() { return new Date(); }, allowUpdate: false },
      modifyTime: { type: 'date', default() { return new Date(); }, allowUpdate: true },
    };
  }
}

module.exports = PermissionAssignmentInfo;
