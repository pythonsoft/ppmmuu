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
class SubscribeType extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'SubscribeType');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false, validation: 'require' },  // companyId
      name: { type: 'string', validation: 'require' },
      photo: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' } },  // 创建人
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
    };
  }
}

module.exports = SubscribeType;
