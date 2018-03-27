/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');
const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   FaqInfo:
 *     required:
 *       - name
 *     properties:
 *       content:
 *         type: string
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class FaqInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'FaqInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      content: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, validation: 'require' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'string' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

module.exports = FaqInfo;
