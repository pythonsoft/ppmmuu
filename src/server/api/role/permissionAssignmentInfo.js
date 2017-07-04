/**
 * Created by steven on 17/5/5.
 */
const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   UserInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       status:
 *         type: string
 *       password:
 *         type: string
 *       createdAt:
 *         type: Date
 */
class PermissionAssignmentInfo extends DB {
  constructor() {
    super(config.dbInstance['umpDB'], 'PermissionAssignmentInfo');

    this.doc = {
      _id : '',    //userId or departmentId or teamId
      roles: [],
      allowedPermissions: [],   //允许权限
      deniedPermissions: [],    //拒绝权限
      createdTime: new Date(),
      modifyTime: new Date()
    }

    this.updateDoc = {roles: 1, allowedPermissions: 1, deniedPermissions: 1, modifyTime: 1};

  }
}

module.exports = PermissionAssignmentInfo;
