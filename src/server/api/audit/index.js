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
 * @permissionGroup: audit
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
 *         description: TemplateGroupInfo
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
 * @permissionGroup: audit
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
 *         description: TemplateGroupInfo
 */
router.get('/list', (req, res) => {
  const keyword = req.query.keyword;
  const type = req.query.type || '';
  const status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const sortFields = req.query['sortFields'] || '-createTime';
  const fieldsNeed = req.query['fieldsNeed'] || '';

  service.list(keyword, '', '', type, status, page, pageSize, sortFields, fieldsNeed, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;
