/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   ManuscriptInfo:
 *     required:
 *       - title
 *       - content
 *     properties:
 *       title:
 *         type: string
 *       viceTitle:
 *         type: string
 *       content:
 *         type: string
 *       creator:
 *         type: object
 *       collaborators:
 *         type: array
 *         items:
 *           type: object
 *       status:
 *         type: object
 *       attachments:
 *         type: array
 *         items:
 *           type: object
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class ManuscriptInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ManuscriptInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      title: { type: 'string', validation: 'require' },
      viceTitle: { type: 'string' },
      collaborators: { type: 'array' },
      content: { type: 'string' },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      status: { type: 'string', default: ManuscriptInfo.STATUS.DRAFTS, validation: v => utils.isValueInObject(v, ManuscriptInfo.STATUS) },
      attachments: { type: 'array' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

ManuscriptInfo.STATUS = {
  DRAFTS: '1',
  SUBMITTED: '2',
  DUSTBIN: '3',
};

ManuscriptInfo.CONVERSION_TYPE = {
  HK_TO_SIMPLIFIED: '0',  // 香港繁体转简体
  SIMPLIFIED_TO_HK: '1',   // 简体转香港繁体
};

ManuscriptInfo.LIST_TYPE = {
  OWNER: '0',        // 自己创建的类型
  COLLABORATOR: '1',  // 协作类型
};

ManuscriptInfo.DELETED = '4';

module.exports = ManuscriptInfo;
