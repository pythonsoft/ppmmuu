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
      _id : '',
      name: '',
      displayName: '', //英文名
      password : '',
      title : "",
      roles: [], //RoleInfo _id
      permissions: [],
      verifyType: UserInfo.VERIFY_TYPE.PASSWORD, //密码验证方式
      company: {
        _id: '',
        name: ''
      },
      department: {
        _id: '',
        name: ''
      },
      team: {
        _id: '',
        name: ''
      },
      createdAt: new Date(),
      description: '',
      employeeId: '',
      email: '',
      phone: '',
      photo: '', //path
      status: UserInfo.STATUS.NORMAL,
      Detail : {}
    }

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

UserInfo.VERIFY_TYPE = {
  PASSWORD: '0', //密码验证
  AD: '1' //域验证，域验证会根据组织里的验证信息去验证
};

module.exports = UserInfo;
