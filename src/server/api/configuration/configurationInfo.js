'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   ConfigurationInfo:
 *     required:
 *       - key
 *       - value
 *       - genre
 *     properties:
 *       key:
 *         type: string
 *         example: "testKey"
 *       value:
 *         type: string
 *         example: "testValue"
 *       genre:
 *         type: string
 *         example: "testGenre"
 *       description:
 *         type: string
 *         example: "A simple description"
 */
class ConfigurationInfo extends DB {
  constructor() {
    const indexes = [{ key: { key: 1 }, unique: true }];
    super(config.dbInstance.umpDB, 'ConfigurationInfo', indexes);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      createdTime: { type: 'date' },
      updatedTime: { type: 'date' },
      key: { type: 'string', validation: 'require' },
      value: { type: 'string', validation: 'require' },
      description: { type: 'string' },
      genre: { type: 'string', validation: 'require' },
    };
  }
}

module.exports = ConfigurationInfo;
