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

    this.doc = {
      _id: '',
      target: {
        _id: '',
        name: '',
        type: '',
      },
      creator: {
        _id: '',
        name: '',
        type: TaskInfo.CREATOR_TYPE.USER,
      },
      category: '',
      command: '',
      parentId: '', // 父结点
      status: TaskInfo.STATUS.READY,
      progress: '0',
      createdTime: new Date(),
      modifyTime: new Date(),
      message: '',
      details: {},
    };

    this.updateDoc = {
      category: 1,
      command: 1,
      status: 1,
      progress: 1,
      modifyTime: 1,
      message: 1,
      details: 1,
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
  SYSTEM: '2'
};

module.exports = TaskInfo;
