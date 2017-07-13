/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const utils = require('../../common/utils');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   TaskInfo:
 *     required:
 *       - target:
 *       - creator:
 *     properties:
 *       target:
 *         type: object
 *         properties:
 *          _id: string
 *          name: string
 *          type: string
 *       creator:
 *         type: object
 *         properties:
 *          _id: string
 *          name: string
 *          type: string
 *       category:
 *         type: string
 *       command:
 *         type: string
 *       parentId:
 *         type: string
 *       status:
 *         type: string
 *       progress:
 *         type: string
 *       createdTime:
 *         type: date
 *       modifyTime:
 *         type: date
 *       message:
 *         type: string
 *       Detail:
 *         type: object
 */
class TaskInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'TaskInfo');

    this.struct = {
      _id: { type: 'string', default: () => uuid.v1() },
      target: { type: 'object', default: { _id: '', name: '', type: '' }, validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '', type: TaskInfo.CREATOR_TYPE.USER }, validation: 'require', allowUpdate: false },
      category: { type: 'string', validation: v => utils.isValueInObject(v, TaskInfo.CREATOR_TYPE) },
      command: { type: 'string' },
      parentId: { type: 'string' }, // 父结点
      status: { type: 'string', default: TaskInfo.STATUS.READY, validation: v => utils.isValueInObject(v, TaskInfo.STATUS) },
      progress: { type: 'number' },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require' },
      message: { type: 'string' },
      details: { type: 'object' },
    };
  }

}

TaskInfo.STATUS = {
  READY: '0',
  DOING: '1',
  SUCCESS: '2',
  FAIL: '100',
  GIVE_UP: '101',
};

TaskInfo.CREATOR_TYPE = {
  USER: '0',
  TEAM: '1',
  SYSTEM: '2',
};

module.exports = TaskInfo;
