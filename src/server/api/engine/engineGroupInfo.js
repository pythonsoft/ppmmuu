/**
 * Created by chaoningx on 2017/7/17.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   EngineInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       logo:
 *         type: string
 *       creator:
 *         type: object
 *       parentId:
 *         type: string
 *       contact:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *           phone: string
 *           email: string
 *       memberCount:
 *         type: integer
 *       ad:
 *         type: string
 *       type:
 *         type: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       deleteDeny:
 *         type: string
 *       detail:
 *         type: object
 */
class EngineGroupInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'EngineGroupInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      parentId: { type: 'string', validation: 'require' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

module.exports = EngineGroupInfo;
