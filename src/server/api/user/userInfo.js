/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const i18n = require('i18next');
const utils = require('../../common/utils');

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
    super(config.dbInstance.umpDB, 'UserInfo');

    this.doc = {
      _id: '',
      name: '',
      displayName: '', // 英文名
      password: '',
      title: '',
      verifyType: UserInfo.VERIFY_TYPE.PASSWORD, // 密码验证方式
      company: {
        _id: '',
        name: '',
      },
      department: {
        _id: '',
        name: '',
      },
      team: {
        _id: '',
        name: '',
      },
      createdTime: new Date(),
      description: '',
      employeeId: '',
      email: '',
      phone: '',
      photo: '', // path
      status: UserInfo.STATUS.NORMAL,
      Detail: {},
    };

    this.updateDoc = this.doc;

    this.createNeedValidateFields = { email: 1, phone: 1, name: 1, displayName: 1, password: 1 };
    this.updateNeedValidateFields = { _id: 1, email: 1, phone: 1, name: 1, displayName: 1, password: 1 };
    this.createGroupUserNeedValidateFields = { email: 1, phone: 1, name: 1, displayName: 1, password: 1, companyId: 1 };
    this.validateFunc = { email: utils.checkEmail, phone: utils.checkPhone, password: utils.checkPassword };
    this.uniqueFields = { email: 1, phone: 1, name: 1 };
  }

  getUserInfo(_id, fields, cb) {
    fields = utils.formatFields(fields);

    this.collection.findOne({ _id }, { fields }, (err, doc) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }
      if (!doc) {
        return cb && cb(i18n.t('userNotFind'));
      }
      return cb && cb(null, doc);
    });
  }
}

UserInfo.STATUS = {
  NORMAL: '0',
  UNACTIVE: '1',
  DELETE: '2',
};

UserInfo.VERIFY_TYPE = {
  PASSWORD: '0', // 密码验证
  AD: '1', // 域验证，域验证会根据组织里的验证信息去验证
};

module.exports = UserInfo;
