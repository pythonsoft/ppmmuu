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
class UserInfo extends DB {
  constructor() {
    super(config.dbInstance['umpDB'], 'UserInfo');

    this.doc = {
      _id: '',
      name: '',
      password: '',
      createdAt: '',
      token: '',
      roles: [],     //RoleInfo _id array
      status: 0
    };

  }

  getUserInfo(id, cb) {
    this.collection.findOne({ _id: id }, { password: 0 }, function(err, doc) {
      cb (err, doc);
    });
  }

}

UserInfo.STATUS = {
  NORMAL: '0',
  UNACTIVE: '1',
  DELETE: '2'
};

module.exports = UserInfo;
