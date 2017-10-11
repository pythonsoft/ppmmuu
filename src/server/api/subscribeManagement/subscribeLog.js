/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   SubscribeLog:
 *     required:
 *       - companyName
 *     properties:
 *       companyName:
 *         type: string
 */
class SubscribeLog extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'SubscribeLog');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false, validation: 'require' },  // companyId
      companyId: { type: 'string', validation: 'require' },
      operationType: { type: 'string', validation: 'require' },
      oldSubscribeInfo: {
        type: 'object', validation: 'require',
      },
      newSubscribeInfo: {
        type: 'object', validation: 'require',
      },
      creator: { type: 'object', default: { _id: '', name: '' } },  // 创建人
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      description: { type: 'string' },
    };
  }
}

SubscribeLog.OPERATION_TYPE = {
  ADD: '0',
  UPDATE: '1',
  DELETE: '2',
};

module.exports = SubscribeLog;
