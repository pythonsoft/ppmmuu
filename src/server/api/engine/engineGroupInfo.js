/**
 * Created by chaoningx on 2017/7/17.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   EngineInfo:
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
class EngineGroupInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'EngineGroupInfo', [
      { key: { name: 1, type: 1, parentId: 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      name: { type: 'string', validation: 'require' },
      logo: { type: 'string' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      parentId: { type: 'string', validation: 'require' },
      contact: { type: 'object', default: { _id: '', name: '', phone: '', email: '' } },
      memberCount: { type: 'number' },
      ad: { type: 'string' }, // 域控设置
      type: { type: 'string', default: EngineGroupInfo.TYPE.COMPANY, validation: v => utils.isValueInObject(v, EngineGroupInfo.TYPE) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      deleteDeny: { type: 'string', default: EngineGroupInfo.DELETE_DENY.YES, validation: v => utils.isValueInObject(v, EngineGroupInfo.DELETE_DENY) }, // 删除保护，创建后默认为保护状态
      detail: { type: 'object' },
    };
  }

}

EngineGroupInfo.TYPE = {
  COMPANY: '0',
  DEPARTMENT: '1',
  TEAM: '2',
};

EngineGroupInfo.DELETE_DENY = {
  YES: '1',
  NO: '0',
};

module.exports = EngineGroupInfo;
