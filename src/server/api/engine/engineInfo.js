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
class EngineInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'EngineInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      code: { type: 'string', validation: 'require' }, //编号
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      belong: { type: 'string' },
      area: { type: 'string', validation: 'require' },
      isVirtual: { type: 'string', default: EngineInfo.IS_VIRTURAL.NO, validation: v => utils.isValueInObject(v, EngineInfo.IS_VIRTURAL) },
      isTest: { type: 'string', default: EngineInfo.IS_TEST.NO, validation: v => utils.isValueInObject(v, EngineInfo.IS_TEST) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      configuration: { type: 'object' }, //配置项
      detail: { type: 'object' },
    };
  }

}

EngineInfo.IS_VIRTURAL = {
  NO: '0',
  YES: '1',
};

EngineInfo.IS_TEST = {
  NO: '0',
  YES: '1',
};

module.exports = EngineInfo;
