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
    super(config.dbInstance.umpDB, 'ConfigurationInfo');

    this.doc = {
      _id: '',
      createdTime: new Date(),
      updatedTime: new Date(),
      key: '',
      value: '',
      description: '',
      genre: '',
    };

    this.updateDoc = this.doc;

    this.createNeedValidateFields = { key: 1, value: 1, genre: 1 };
    this.updateNeedValidateFields = this.doc;
    this.uniqueFields = { _id: 1, key: 1 };
  }
}

module.exports = ConfigurationInfo;
