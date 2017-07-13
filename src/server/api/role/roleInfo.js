/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   RoleInfo:
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
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class RoleInfo extends DB {
  constructor() {
    const indexes = [{ key:{name: 1}, unique: true }];
    super(config.dbInstance.umpDB, 'RoleInfo', indexes);

    this.struct = {
      _id: { type: String, default: '', validation: 'require', unique: true},
      name: { type: String, default: '', validation: 'require', unique: true },
      creator: { type: Object, default: { _id: '', name: '' }, allowUpdate: false },
      allowedPermissions: { type: Array, default: [], allowUpdate: true }, // PermissionInfo path
      deniedPermissions: { type: Array, default: [], allowUpdate: true }, // PermissionInfo path
      createdTime: { type: Date, default() { return new Date(); }, allowUpdate: false },
      modifyTime: { type: Date, default() { return new Date(); }, allowUpdate: true },
      description: { type: String, default: '', allowUpdate: true },
      detail: { type: Object, default: {}, allowUpdate: true },
    };
  }
}

module.exports = RoleInfo;
