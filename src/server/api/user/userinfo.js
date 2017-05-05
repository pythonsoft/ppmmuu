/**
 * Created by steven on 17/5/5.
 */
const DB = require('../../common/db');


/**
 * @swagger
 * definitions:
 *   User:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       status:
 *         type: string
 */
class UserInfo extends DB {
  constructor() {
    super('UserInfo');
    this.doc = {
      _id: '',
      name: '',
      status: 0
    };
  }
};

UserInfo.STATUS = {
  NORMAL: '0',
  UNACTIVE: '1',
  DELETE: '2'
};

module.exports = UserInfo;
