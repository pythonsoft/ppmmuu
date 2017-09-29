'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   SearchHistoryInfo:
 *     required:
 *       - userId
 *       - keyword
 *     properties:
 *       userId:
 *         type: string
 *       keyword:
 *         type: string
 *       createdTime:
 *         type: string
 *       updatedTime:
 *         type: string
 *       count:
 *         type: int
 */
class SearchHistoryInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'SearchHistoryInfo', [
      { key: { userId: 1, keyword: 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      userId: { type: 'string', validation: 'require' },
      keyword: { type: 'string', validation: 'require' },
      createdTime: { type: 'date', allowUpdate: false },
      updatedTime: { type: 'date' },
      count: { type: 'number', default: 1 },
    };
  }
}

module.exports = SearchHistoryInfo;
