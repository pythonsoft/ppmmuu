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
 *   AuditInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       createTime:
 *         type: string
 *       lastModify:
 *         type: string
 *       description:
 *         type: string
 *       status:
 *         type: string
 *       message:
 *         type: string
 *       type:
 *         type: string
 *       applicant:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *           companyId:
 *             type: string
 *           companyName:
 *             type: string
 *           departmentId:
 *             type: string
 *           departmentName:
 *             type: string
 *       verifier:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *           companyId:
 *             type: string
 *           companyName:
 *             type: string
 *           departmentId:
 *             type: string
 *           departmentName:
 *             type: string
 *       Detail:
 *         type: object
 */
class auditInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'audit_auditInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      name: { type: 'string', validation: 'require' },
      createTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModify: { type: 'date', validation: 'require' },
      status: { type: 'string', default: auditInfo.STATUS.WAITING, validation: v => utils.isValueInObject(v, auditInfo.STATUS) },
      type: { type: 'string', default: auditInfo.TYPE.DOWNLOAD, validation: v => utils.isValueInObject(v, auditInfo.TYPE) },
      applicant: { type: 'object',
        default() {
          return {
            _id: '',
            name: '',
            companyId: '',
            companyName: '',
            departmentName: '',
            departmentId: '',
          };
        } }, // 申请人信息
      verifier: { type: 'object',
        default() {
          return {
            _id: '',
            name: '',
            companyId: '',
            companyName: '',
            departmentName: '',
            departmentId: '',
          };
        } }, // 审核人信息
      message: { type: 'string' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

  createApplicantOrVerifier(info) {
    return utils.merge({
      _id: '',
      name: '',
      companyId: '',
      companyName: '',
      departmentName: '',
      departmentId: '',
    }, info);
  }
}

auditInfo.STATUS = {
  WAITING: '1',
  PASS: '2',
  REJECT: '3',
};

auditInfo.TYPE = {
  DOWNLOAD: '1',
};

module.exports = auditInfo;

