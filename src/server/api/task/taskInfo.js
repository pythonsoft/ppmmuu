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
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       displayName:
 *         type: string
 *       password:
 *         type: string
 *       createdTime:
 *         type: string
 *       company:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       department:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       team:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       verifyType:
 *         type: string
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       employeeId:
 *         type: string
 *       email:
 *         type: string
 *       phone:
 *         type: string
 *       photo:
 *         type: string
 *       status:
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
        type: '',
      },
      category: '',
      command: '',
      parentId: '', // 父结点
      status: TaskInfo.STATUS.READY,
      progress: 0,
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

module.exports = TaskInfo;
