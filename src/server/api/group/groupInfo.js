/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

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
 *         properties:
 *           _id: string
 *           name: string
 *           phone: string
 *           email: string
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
    super(config.dbInstance.umpDB, 'GroupInfo');

    this.struct = {
      _id: { type: 'string', default: '', validation: 'require', unique: true },
      name: { type: 'string', default: '', validation: 'require', allowUpdate: true },
      logo: { type: 'string', default: '', allowUpdate: true },
      creator: { type: 'object', default: {} },
      parentId: { type: 'string', default: ''},
      contact: { type: 'object', default: {
        _id: '',
        name: '',
        phone: '',
        email: '',
      }, allowUpdate: true},
      memberCount: { type: 'number', default: 0, allowUpdate: true } ,
      ad: { type: 'string', default: '', allowUpdate: true }, // 域控设置
      type: { type: 'string', default: GroupInfo.TYPE.COMPANY, allowUpdate: true },
      createdTime: { type: 'date', default: function() { return new Date()} },
      modifyTime: { type: 'date', default: function() { return new Date()}, allowUpdate: true },
      description: { type: 'string', default: '', allowUpdate: true },
      deleteDeny: { type: 'string', default: GroupInfo.DELETE_DENY.YES, allowUpdate: true }, // 删除保护，创建后默认为保护状态
      detail: { type: 'object', default: {}, allowUpdate: true },
    };
  }

  validateType(type = '') {
    for (const key in GroupInfo.TYPE) {
      if (GroupInfo.TYPE[key] === type) {
        return true;
      }
    }
    return false;
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

module.exports = GroupInfo;
