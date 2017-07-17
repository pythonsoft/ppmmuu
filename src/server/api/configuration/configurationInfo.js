'use strict';

const DB = require('../../common/db');
const config = require('../../config');

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
 *         type: String
 *         example: "testKey"
 *       value:
 *         type: String
 *         example: "testValue"
 *       genre:
 *         type: String
 *         example: "testGenre"
 *       description:
 *         type: String
 *         example: "A simple description"
 */
class ConfigurationInfo extends DB {
  constructor() {
    const indexes = [{ key: { key: 1 }, unique: true }];
    super(config.dbInstance.umpDB, 'ConfigurationInfo', indexes);

    this.struct = {
      _id: { type: 'string', validation: 'require' },
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
