/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   PermissionGroup:
 *     required:
 *       - name
 *       - index
 *     properties:
 *       name:
 *         type: string
 *       index:
 *         type: string
 *       parentIndex:
 *         type: string
 *       description:
 *         type: string
 */
class PermissionGroup extends DB {
  constructor() {
    const indexes = [
      { key: { index: 1 }, name: 'permission_group_index', unique: true },
    ];

    super(config.dbInstance.umpDB, 'PermissionGroup', indexes);

    this.struct = {
      _id: { type: 'string', validation: 'require', allowUpdate: false },
      name: { type: 'string', validation: 'require', allowUpdate: false },
      index: { type: 'string', validation: 'require', allowUpdate: false },
      parentIndex: { type: 'string' },
      description: { type: 'string' },
    };
  }
}

module.exports = PermissionGroup;
