/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const utils = require('../../common/utils');
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
      _id: { type: 'string', validation: 'require', allowUpdate: false }, // userId or departmentId or teamId
      type: { type: 'string', validation: function(v){return utils.isValueInObject(v, PermissionAssignmentInfo.TYPE)} , allowUpdate: false },
      roles: { type: 'array' },
      allowedPermissions: { type: 'array' }, // 允许权限
      deniedPermissions: { type: 'array' }, // 拒绝权限
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
    };
  }
}

PermissionAssignmentInfo.TYPE = {
  USER: '0',
  COMPANY: '1',
  DEPARTMENT: '2',
  TEAM: '3',
};

module.exports = PermissionAssignmentInfo;
