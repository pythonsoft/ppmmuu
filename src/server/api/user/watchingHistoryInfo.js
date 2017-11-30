'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   WatchingHistoryInfo:
 *     required:
 *       - userId
 *       - videoId
 *     properties:
 *       userId:
 *         type: string
 *       videoId:
 *         type: string
 *       createdTime:
 *         type: string
 *       updatedTime:
 *         type: string
 *       count:
 *         type: int
 *       videoContent:
 *         type: string
 */
class WatchingHistoryInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'WatchingHistoryInfo', [
      { key: { userId: 1, videoId: 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      userId: { type: 'string', validation: 'require' },
      videoId: { type: 'string', validation: 'require' },
      fromWhere: { type: 'string', default: 'MAM' },
      createdTime: { type: 'date', allowUpdate: false },
      updatedTime: { type: 'date' },
      count: { type: 'number', default: 1 },
      videoContent: { type: 'object', default: {} },
      status: { type: 'string', default: 'unavailable' },
    };
  }
}

WatchingHistoryInfo.STATUS = {
  UNAVAILABLE: 'unavailable',
  PROCESSING: 'processing',
  AVAILABLE: 'available',
};

module.exports = WatchingHistoryInfo;
