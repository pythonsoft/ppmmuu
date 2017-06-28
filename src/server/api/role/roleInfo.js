/**
 * Created by steven on 17/5/5.
 */
const DB = require('../../common/db');

/**
 * @swagger
 * definitions:
 *   RoleInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       permissions:
 *         type: Array
 */
class RoleInfo extends DB {
  constructor() {
    super('RoleInfo');

    this.doc = {
      _id: '',
      name: '',
      permissions: []
    };

    this.updateDoc = { name: 1, permissions: 1 };
  }

};

module.exports = RoleInfo;
