/**
 * Created by chaoningx on 17/11/18.
 * 用于记录用户已读消息的位置
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

class ActivityInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'IM_ActivityInfo');

    this.struct = {
      _id: { type: 'string', default: () => uuid.v1() },
      ownerId: { type: 'string' },
      sessionId: { type: 'string', validation: 'require', allowUpdate: false },
      seq: { type: 'number' },
      details: { type: 'object' },
    };
  }
}

module.exports = ActivityInfo;
