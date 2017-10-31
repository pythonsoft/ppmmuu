/**
 * Created by chaoningx on 17/10/12.
 */


'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   AuditRuleInfo:
 *     required:
 *       - ownerName
 *     properties:
 *       ownerName:
 *         type: string
 *       permissionType:
 *         type: string
 *       whitelist:
 *         type: array
 *         items:
 *          type: string
 *       creator:
 *         type: object
 *       auditDepartment:
 *         type: object
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       Detail:
 *         type: object
 */
class auditRuleInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'audit_ruleInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      ownerName: { type: 'string', validation: 'require' }, // 资源所属部门的名字，为什么用名字，因为MAM里边的部门名字与行政系统中部门名字不一致
      permissionType: { type: 'string', default: auditRuleInfo.PERMISSTION_TYPE.PUBLIC, validation: v => utils.isValueInObject(v, auditRuleInfo.PERMISSTION_TYPE) },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      auditDepartment: { type: 'object', default: { _id: '', name: '' } }, // 审核部门
      whitelist: { type: 'array' }, // 授权白名单，无须审核就可能进行下载相关文件 [{ _id: '', name: '', type: '部门，小组，可以使用帐户系统中的分类型', exts: '允许下载的文件类型，以后缀做区分，全部：all，除此外使用逗号分割，如: .mxf,.mp4', }]
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

auditRuleInfo.PERMISSTION_TYPE = {
  PUBLIC: '1',
  AUDIT: '2',
};

module.exports = auditRuleInfo;

