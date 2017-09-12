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
    super(config.dbInstance.umpDB, 'WatchingHistoryInfo', [
      { key: { userId: 1, videoId: 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      userId: { type: 'string', validation: 'require' },
      videoId: { type: 'string', validation: 'require' },
      createdTime: { type: 'date', allowUpdate: false },
      updatedTime: { type: 'date', allowUpdate: true },
      count: { type: 'number', default: 1 },
      videoContent: { type: 'string', default: '' },
      status: { type: 'string', default: 'unavailable' },
    };
  }
}

module.exports = WatchingHistoryInfo;
