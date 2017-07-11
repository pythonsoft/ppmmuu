/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   TacticsInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       sourceType:
 *         type: string
 *       sourceId:
 *         type: string
 *       type:
 *         type: string
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       status:
 *         type: string
 *       script:
 *         type: string
 *       priority:
 *         type: string
 *       triggerType:
 *         type: string
 *       scheduleType:
 *         type: string
 *       scheduleTime:
 *         type: string
 *       orderBy:
 *         type: string
 *       itemCount:
 *         type: number
 *       frequency:
 *         type: number
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class TacticsInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'TacticsInfo');

    this.doc = {
      _id: '',
      name: '',
      source: {
        _id: '',
        name: '',
        type: TacticsInfo.SOURCE_TYPE.STORAGE,
      },
      type: '',
      creator: { _id: '', name: '' },
      status: TacticsInfo.STATUS.NORMAL,
      script: '',
      priority: TacticsInfo.PRIORITY.NORMAL, // less is high
      triggerType: TacticsInfo.TRIGGER_TYPE.LINE,
      scheduleType: TacticsInfo.SCHEDULE_TYPE.EVERY_MONTH,
      scheduleTime: '',
      orderBy: TacticsInfo.ORDER_BY.CREATE_TIME,
      itemCount: 10, // 每次提交对象数
      frequency: 60, // 提交频率(秒)
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      detail: {},
    };
  }

}

TacticsInfo.SOURCE_TYPE = {
  STORAGE: '0',
  PATH: '1',
};

TacticsInfo.TYPE = {
  ARCHIVE: '0',
  CLEAR_ONLINE: '1',
  DELETE_OBJECT: '2',
  CLEAR_PART_OF_DOWNLOAD_FILE: '3',
  DELETE_FILE: '4',
  CANCEL_PUBLISH: '5',
  DELETE_MANUALLY: '6',
};

TacticsInfo.STATUS = {
  NORMAL: '0',
  HAND_UP: '1',
};

TacticsInfo.PRIORITY = {
  HIGH: '0',
  NORMAL: '1',
  LOW: '2',
};

TacticsInfo.TRIGGER_TYPE = {
  LINE: '0',
  TIME: '1',
  LINE_TIME: '2',
};

TacticsInfo.SCHEDULE_TYPE = {
  NOW: '0',
  EVERY_DAY: '1',
  EVERY_WEEK: '2',
  EVERY_MONTH: '3',
  EVERY_YEAR: '4',
};

TacticsInfo.ORDER_BY = {
  CREATE_TIME: '0',
  LAST_VISIT_TIME: '1',
  VISIT_COUNT: '2',
};

module.exports = TacticsInfo;
