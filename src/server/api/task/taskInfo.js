/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
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
      _id: { type: 'string', default: '', validation: 'require', unique: true },
      target: { type: 'object', default: {
        _id: '',
        name: '',
        type: '',
      }},
      creator: { type: 'object', default: {
        _id: '',
        name: '',
        type: TaskInfo.CREATOR_TYPE.USER,
      }},
      category: { type: 'string', default: '', allowUpdate: true},
      command: { type: 'string', default: '', allowUpdate: true},
      parentId: { type: 'string', default: '', allowUpdate: true}, // 父结点
      status: { type: 'string', default: TaskInfo.STATUS.READY, allowUpdate: true},
      progress: { type: 'string', default: '0', allowUpdate: true},
      createdTime: { type: 'date', default: function(){ return new Date()}},
      modifyTime: { type: 'date', default: function(){ return new Date()}, allowUpdate: true},
      message: { type: 'string', default: '0', allowUpdate: true},
      details: { type: 'object', default: {}, allowUpdate: true},
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
