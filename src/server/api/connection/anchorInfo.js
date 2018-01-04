/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   GroupInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       logo:
 *         type: string
 *       creator:
 *         type: object
 *       parentId:
 *         type: string
 *       contact:
 *         type: object
 *       memberCount:
 *         type: integer
 *       ad:
 *         type: string
 *       type:
 *         type: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       deleteDeny:
 *         type: string
 *       detail:
 *         type: object
 */
class GroupInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'GroupInfo', [
      { key: { name: 1, type: 1, parentId: 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      name: { type: 'string', validation: 'require' },
      logo: { type: 'string' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      parentId: { type: 'string' },
      contact: { type: 'object', default: { _id: '', name: '', phone: '', email: '' } },
      memberCount: { type: 'number' },
      ad: { type: 'string' }, // 域控设置
      type: { type: 'string', default: GroupInfo.TYPE.COMPANY, validation: v => utils.isValueInObject(v, GroupInfo.TYPE) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      deleteDeny: { type: 'string', default: GroupInfo.DELETE_DENY.YES, validation: v => utils.isValueInObject(v, GroupInfo.DELETE_DENY) }, // 删除保护，创建后默认为保护状态
      detail: { type: 'object' },
      mediaExpressUser: { type: 'object', default: { username: '', password: '', userType: '', companyName: '' } },
    };
  }

}

GroupInfo.TYPE = {
  COMPANY: '0',
  DEPARTMENT: '1',
  TEAM: '2',
};

GroupInfo.DELETE_DENY = {
  YES: '1',
  NO: '0',
};

GroupInfo.MEDIAEXPRESS_USER_TYPE = {
  COMPANYUSER: 0,   // 普通成员
  COMPANYADMIN: 1,  // 组织管理员
  PERSONUSER: 3, //个人用户
};

module.exports = GroupInfo;
