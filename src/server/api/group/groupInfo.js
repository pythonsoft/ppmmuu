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
 *       parentId:
 *         type: string
 */
class GroupInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'GroupInfo');

    this.doc = {
      _id: '',
      name: '',
      logo: '',
      creator: {},
      parentId: '',
      contact: {
        _id: '',
        name: '',
        phone: '',
        email: '',
      },
      memberCount: 0,
      ad: '', // 域控设置
      type: GroupInfo.TYPE.COMPANY,
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      deleteDeny: GroupInfo.DELETE_DENY.YES, // 删除保护，创建后默认为保护状态
      detail: {},
    };

    this.updateDoc = {
      name: 1,
      logo: 1,
      parentId: 1,
      contact: 1,
      count: 1,
      ad: 1,
      type: 1,
      modifyTime: 1,
      detail: 1,
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
