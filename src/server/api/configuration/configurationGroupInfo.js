'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   ConfigurationGroupInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: String
 */
class ConfigurationGroupInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ConfigurationGroupInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require', default() { return uuid.v1(); } },
      createdTime: { type: 'date', default: new Date() },
      updatedTime: { type: 'date', default: new Date() },
      name: { type: 'string', validation: 'require' },
      parent: { type: 'string', default: '' },
      children: { type: 'array', default: [] },
    };
  }
}

module.exports = ConfigurationGroupInfo;
