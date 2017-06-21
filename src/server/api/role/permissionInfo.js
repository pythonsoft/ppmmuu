/**
 * Created by steven on 17/5/5.
 */
const DB = require('../../common/db');


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
 */
class PermissionInfo extends DB {
  constructor() {
    super('PermissionInfo');
    this.doc = {
      _id: '',
      name: '',
      path: ''
    };
  }
};

module.exports = PermissionInfo;
