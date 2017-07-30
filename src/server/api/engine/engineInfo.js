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
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      code: { type: 'string' }, // 编号
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      belong: { type: 'string' },
      groupId: { type: 'string' },
      area: { type: 'string' },
      isVirtual: { type: 'string', default: EngineInfo.IS_VIRTURAL.NO, validation: v => utils.isValueInObject(v, EngineInfo.IS_VIRTURAL) },
      isTest: { type: 'string', default: EngineInfo.IS_TEST.NO, validation: v => utils.isValueInObject(v, EngineInfo.IS_TEST) },
      ip: { type: 'string' },
      intranetIp: { type: 'string' },
      isInstallMonitor: { type: 'string', default: EngineInfo.IS_INSTALL_MONITOR.NO, validation: v => utils.isValueInObject(v, EngineInfo.IS_INSTALL_MONITOR) },
      command: { type: 'string', default: EngineInfo.COMMAND.NORMAL, validation: v => utils.isValueInObject(v, EngineInfo.COMMAND) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      configuration: { type: 'array' }, // 配置项
      detail: { type: 'object' },
    };
  }

}

EngineInfo.configurationItem = {
  key: '',
  value: '',
  description: '',
};

EngineInfo.IS_VIRTURAL = {
  NO: '0',
  YES: '1',
};

EngineInfo.IS_TEST = {
  NO: '0',
  YES: '1',
};

EngineInfo.IS_INSTALL_MONITOR = {
  NO: '0',
  YES: '1',
};

EngineInfo.COMMAND = {
  NORMAL: '0',
  INSTALL_MONITOR: '1',
  STOP: '2',
  REBOOT: '3',
};

module.exports = EngineInfo;
