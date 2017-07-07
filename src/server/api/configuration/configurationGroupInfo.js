'use strict';

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
    super(config.dbInstance.umpDB, 'ConfigurationGroupInfo');

    this.doc = {
      _id: '',
      createdTime: new Date(),
      updatedTime: new Date(),
      name: '',
      parent: '',
      children: [],
    };

    this.updateDoc = this.doc;

    this.createNeedValidateFields = { name: 1 };
    this.updateNeedValidateFields = { updatedTime: 1, name: 1 };
    this.uniqueFields = { _id: 1 };
  }
}

module.exports = ConfigurationGroupInfo;
