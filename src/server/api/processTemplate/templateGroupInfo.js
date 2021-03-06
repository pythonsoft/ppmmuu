
'use strict';

const DB = require('../../common/db');
const utils = require('../../common/utils');
const uuid = require('uuid');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   ProcessTemplateGroupInfo:
 *     required:
 *       - name
 *       - _id
 *     properties:
 *       name:
 *         type: string
 *       creator:
 *         type: object
 *       parentId:
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
class TemplateGroupInfo extends DB {
  constructor() {
    const indexes = [
      { key: { name: 1 }, name: 'permission_name', unique: true },
    ];
    super(config.dbInstance[`${config.dbName}DB`], 'ProcessTemplateGroupInfo', indexes);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      parentId: { type: 'string', allowUpdate: false },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      deleteDeny: { type: 'string', default: TemplateGroupInfo.DELETE_DENY.YES, validation: v => utils.isValueInObject(v, TemplateGroupInfo.DELETE_DENY) }, // 删除保护，创建后默认为保护状态
      detail: { type: 'object' },
      users: { type: 'array' },     // 使用这个模板的人，可以是公司,部门和组织
    };
  }
}

TemplateGroupInfo.DELETE_DENY = {
  YES: '1',
  NO: '0',
};

module.exports = TemplateGroupInfo;
