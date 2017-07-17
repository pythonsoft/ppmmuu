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
 *   TacticsInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       source:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *           type: string
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
      _id: { type: 'string', default() { return uuid.v1(); } },
      name: { type: 'string', validation: 'require' },
      source: { type: 'object',
        default: {
          _id: '',
          name: '',
          type: TacticsInfo.SOURCE_TYPE.BUCKET,
        },
        validation: 'require' },
      type: { type: 'string', default: TacticsInfo.TYPE.ARCHIVE, validation: v => utils.isValueInObject(v, TacticsInfo.TYPE) },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false, validation: 'require' },
      status: { type: 'string', default: TacticsInfo.STATUS.NORMAL, validation: v => utils.isValueInObject(v, TacticsInfo.STATUS) },
      script: { type: 'string' },
      priority: { type: 'string', default: TacticsInfo.PRIORITY.NORMAL, validation: v => utils.isValueInObject(v, TacticsInfo.PRIORITY) }, // less is high
      triggerType: { type: 'string', default: TacticsInfo.TRIGGER_TYPE.LINE, validation: v => utils.isValueInObject(v, TacticsInfo.TRIGGER_TYPE) },
      scheduleType: { type: 'string', default: TacticsInfo.SCHEDULE_TYPE.EVERY_MONTH, validation: v => utils.isValueInObject(v, TacticsInfo.EVERY_MONTH) },
      scheduleTime: { type: 'string', validation: v => /[0-9]{4}-[0-9]{2}-[0-9]{2}[\s][0-9]{2}:[0-9]{2}:[0-9]{2}/.test(v) },
      orderBy: { type: 'string', default: TacticsInfo.ORDER_BY.CREATE_TIME, validation: v => utils.isValueInObject(v, TacticsInfo.ORDER_BY) },
      itemCount: { type: 'number', default: 10 }, // 每次提交对象数
      frequency: { type: 'number', default: 60 }, // 提交频率(秒)
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

TacticsInfo.SOURCE_TYPE = {
  BUCKET: '0',
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
