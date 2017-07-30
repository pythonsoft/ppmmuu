/**
 * Created by chaoningx on 2017/7/17.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const utils = require('../../common/utils');
const config = require('../../config');

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
    super(config.dbInstance.umpDB, 'EngineGroupInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      parentId: { type: 'string', allowUpdate: false },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      type: { type: 'string', default: EngineGroupInfo.TYPE.USER, validation: v => utils.isValueInObject(v, EngineGroupInfo.TYPE), allowUpdate: false }, // 删除保护，创建后默认为保护状态,
      deleteDeny: { type: 'string', default: EngineGroupInfo.DELETE_DENY.YES, validation: v => utils.isValueInObject(v, EngineGroupInfo.DELETE_DENY) }, // 删除保护，创建后默认为保护状态
      detail: { type: 'object' },
    };
  }

}

EngineGroupInfo.DELETE_DENY = {
  YES: '1',
  NO: '0',
};

EngineGroupInfo.TYPE = {
  SYSTEM: '1',
  USER: '0',
};


module.exports = EngineGroupInfo;
