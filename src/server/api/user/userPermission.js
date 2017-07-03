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
class UserPermission extends DB {
  constructor() {
    super(config.dbInstance['umpDB'], 'UserPermission');
    
    this.doc = {
      _id : '',    //userId or departmentId or teamId
      roles: [],
      allowedPermissions: [],   //允许权限
      deniedPermissions: [],    //拒绝权限
    }

  }
}

module.exports = UserPermission;
