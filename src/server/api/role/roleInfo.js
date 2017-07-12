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
    super(config.dbInstance.umpDB, 'RoleInfo');

    this.doc = {
      _id: '',
      name: '',
      creator: { _id: '', name: '' },
      allowedPermissions: [], // PermissionInfo path
      deniedPermissions: [], // PermissionInfo path
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      detail: {},
    };

    this.updateDoc = { name: 1, allowedPermissions: 1, deniedPermissions: 1, description: 1, detail: 1, modifyTime: 1 };
    this.createNeedValidateFields = { _id: 1, name: 1};
    this.updateNeedValidateFields = { _id: 1, name: 1 };
    this.uniqueFields = { _id: 1, name: 1 };
  }
}

module.exports = RoleInfo;
