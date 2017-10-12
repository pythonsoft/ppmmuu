/**
 * Created by steven on 17/5/5.
 * 管理模块使用此文件中的所有接口。其它地方不可调用
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: auditManager
 * @permissionName: auditPass
 * @permissionPath: /audit/pass
 * @apiName: auditPass
 * @apiFuncType: post
 * @apiFuncUrl: /audit/pass
 * @swagger
 * /audit/pass:
 *   post:
 *     description: pass audit
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ids
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditInfo
 */
router.post('/pass', (req, res) => {
  const ids = req.body.ids;

  const verifier = {
    _id: req.ex.userInfo._id,
    name: req.ex.userInfo.name,
    companyId: req.ex.company._id,
    companyName: req.ex.company.name,
    departmentId: req.ex.department._id,
    departmentName: req.ex.department.name,
  };

  service.passOrReject(true, ids, verifier, message, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: auditManager
 * @permissionName: listAudit
 * @permissionPath: /audit/list
 * @apiName: listAudit
 * @apiFuncType: get
 * @apiFuncUrl: /audit/list
 * @swagger
 * /audit/list:
 *   get:
 *     description: list audit
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         description:
 *         required: false
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         description:
 *         required: false
 *         type: integer
 *         default: 30
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description:
 *         required: false
 *         type: string
 *         default: '-createTime'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditInfo
 */
router.get('/list', (req, res) => {
  const keyword = req.query.keyword;
  const type = req.query.type || '';
  const status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const sortFields = req.query.sortFields || '-createTime';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.list(keyword, '', '', type, status, page, pageSize, sortFields, fieldsNeed, (err, docs) => res.json(result.json(err, docs)));
});

//审核授权
/**
 * @permissionGroup: auditManager
 * @permissionName: listAuditRule
 * @permissionPath: /audit/listAuditRule
 * @apiName: listAuditRule
 * @apiFuncType: get
 * @apiFuncUrl: /audit/listAuditRule
 * @swagger
 * /audit/listAuditRule:
 *   get:
 *     description: list audit rule
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditRuleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: creatorId
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         description:
 *         required: false
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         description:
 *         required: false
 *         type: integer
 *         default: 30
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description:
 *         required: false
 *         type: string
 *         default: '-createTime'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditRuleInfo
 */
router.get('/listAuditRule', (req, res) => {
  const creatorId = req.query.creatorId || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const sortFields = req.query.sortFields || '-createTime';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listRole(creatorId, page, pageSize, sortFields, fieldsNeed, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: auditManager
 * @permissionName: createAuditRule
 * @permissionPath: /audit/createAuditRule
 * @apiName: createAuditRule
 * @apiFuncType: post
 * @apiFuncUrl: /audit/createAuditRule
 * @swagger
 * /audit/createAuditRule:
 *   post:
 *     description: create audit rule
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditRuleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ownerName
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: permissionType
 *         description:
 *         required: false
 *         type: string
 *         default: '公开: 1 审核: 2'
 *         collectionFormat: csv
 *       - in: body
 *         name: auditDepartment
 *         description:
 *         required: false
 *         type: string
 *         default: '当permissionType为审核时，此为改填写项，{_id: 部门ID, name: 部门名 }'
 *         collectionFormat: csv
 *       - in: body
 *         name: whitelist
 *         description:
 *         required: false
 *         type: string
 *         default: '[{ _id: 标识, name: 名称, type: 部门:1或小组2 }]'
 *         collectionFormat: csv
 *       - in: body
 *         name: description
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: detail
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditRuleInfo
 */
router.post('/createAuditRule', (req, res) => {
  const creator = {
    _id: req.ex.userInfo._id,
    name: req.ex.userInfo.name,
  };

  service.createAuditRule(req.body, creator, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: auditManager
 * @permissionName: updateAuditRule
 * @permissionPath: /audit/updateAuditRule
 * @apiName: updateAuditRule
 * @apiFuncType: post
 * @apiFuncUrl: /audit/updateAuditRule
 * @swagger
 * /audit/updateAuditRule:
 *   post:
 *     description: update audit rule
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditRuleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: ownerName
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: permissionType
 *         description:
 *         required: false
 *         type: string
 *         default: '公开: 1 审核: 2'
 *         collectionFormat: csv
 *       - in: body
 *         name: auditDepartment
 *         description:
 *         required: false
 *         type: string
 *         default: '当permissionType为审核时，此为改填写项，{_id: 部门ID, name: 部门名 }'
 *         collectionFormat: csv
 *       - in: body
 *         name: whitelist
 *         description:
 *         required: false
 *         type: string
 *         default: '[{ _id: 标识, name: 名称, type: 部门:1或小组2 }]'
 *         collectionFormat: csv
 *       - in: body
 *         name: description
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: detail
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditRuleInfo
 */
router.post('/updateAuditRule', (req, res) => {
  service.updateAuditRule(req.body, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: auditManager
 * @permissionName: removeAuditRule
 * @permissionPath: /audit/removeAuditRule
 * @apiName: removeAuditRule
 * @apiFuncType: post
 * @apiFuncUrl: /audit/removeAuditRule
 * @swagger
 * /audit/removeAuditRule:
 *   post:
 *     description: remove audit rule
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditRuleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ids
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AuditRuleInfo
 */
router.post('/removeAuditRule', (req, res) => {
  service.removeAuditRule(req.body.ids, err => res.json(result.json(err, 'ok')));
});

module.exports = router;
