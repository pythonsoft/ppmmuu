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
      _id: { type: 'string' },
      name: { type: 'string', validation: 'require' },
      logo: { type: 'string' },
      creator: { type: 'object', default: {
        _id: '',
        name: ''
      }, allowUpdate: false },
      parentId: { type: 'string', default: '' },
      contact: { type: 'object',
        default: {
          _id: '',
          name: '',
          phone: '',
          email: '',
        },
        allowUpdate: true },
      memberCount: { type: 'number', default: 0 },
      ad: { type: 'string' }, // 域控设置
      type: { type: 'string', default: GroupInfo.TYPE.COMPANY, validation: function(v) {
        let flag = false;
        for (const key in GroupInfo.TYPE) {
          if (GroupInfo.TYPE[key] === type) {
            flag = true;
            break;
          }
        }
        return flag;
      }},
      createdTime: { type: 'date', default() { return new Date(); }, allowUpdate: false },
      modifyTime: { type: 'date', default() { return new Date(); } },
      description: { type: 'string' },
      deleteDeny: { type: 'string', default: GroupInfo.DELETE_DENY.YES, validation: function(v) {
        return GroupInfo.DELETE_DENY.YES === v || GroupInfo.DELETE_DENY.NO === v;
      }}, // 删除保护，创建后默认为保护状态
      detail: { type: 'object' },
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
