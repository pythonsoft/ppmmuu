/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const i18n = require('i18next');
const utils = require('../../common/utils');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   UserInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       displayName:
 *         type: string
 *       password:
 *         type: string
 *       createdTime:
 *         type: string
 *       company:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       department:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       team:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       verifyType:
 *         type: string
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       employeeId:
 *         type: string
 *       email:
 *         type: string
 *       phone:
 *         type: string
 *       photo:
 *         type: string
 *       status:
 *         type: string
 *       Detail:
 *         type: object
 */
class UserInfo extends DB {
  constructor() {

    const indexes = [{ key:{name: 1}, unique: true },{ key: { email: 1}, unique: true}, { key: {phone: 1}, unique: true}];
    super(config.dbInstance.umpDB, 'UserInfo', indexes);

    this.struct = {
      _id: { type: 'string', default(){ return uuid.v1() }, validation: 'require'},
      name: { type: 'string', validation: 'require'},
      displayName: { type: 'string' },
      password: { type: 'string', validation: utils.checkPassword},
      title: { type: 'string', default: '', allowUpdate: true },
      verifyType: { type: 'string', default: UserInfo.VERIFY_TYPE.PASSWORD },
      company: { type: 'object', default: { _id: '', name: '' }},
      department: { type: 'object', default: { _id: '', name: '' }},
      team: { type: 'object', default: { _id: '', name: '' } },
      createdTime: { type: 'date'},
      description: { type: 'string'},
      employeeId: { type: 'string'},
      email: { type: 'string', validation: utils.checkEmail },
      phone: { type: 'string', validation: utils.checkPhone },
      photo: { type: 'string'},
      status: { type: 'string', default: UserInfo.STATUS.NORMAL},
      detail: { type: 'object'},
    };
  }

  getUserInfo(_id, fields, cb) {
    fields = utils.formatSortOrFieldsParams(fields);
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
