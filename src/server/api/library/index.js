/**
 * Created by steven on 17/5/5.
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
 * @permissionName: 列举出库中所有模板
 * @permissionPath: /library/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /library/list
 * @swagger
 * /library/list:
 *   get:
 *     description: list library template
 *     tags:
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Download '0'
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description: sort by this params
 *         required: false
 *         type: string
 *         default: createdTime
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description: request only you need fields
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         description:
 *         required: false
 *         type: string
 *         default: '1'
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         description: ''
 *         required: false
 *         type: string
 *         default: '20'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/list', (req, res) => {
  const type = req.query.type || '';
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;

  service.list(type, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 库创建下模板
 * @permissionPath: /library/createDownloadTemplate
 * @apiName: createDownloadTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /library/createDownloadTemplate
 * @swagger
 * /library/createDownloadTemplate:
 *   post:
 *     description: create directory under project
 *     tags:
 *       - template
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description:
 *         schema:
 *          type: object
 *          required:
 *            - name
 *            - bucketId
 *            - script
 *            - id
 *          properties:
 *            name:
 *              type: string
 *              example: ''
 *            id:
 *              type: string
 *              example: ''
 *            description:
 *              type: string
 *              example: ''
 *            bucketId:
 *              type: string
 *              example: ''
 *            script:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: template
 */
router.post('/createDownloadTemplate', (req, res) => {
  const userId = req.ex.userInfo._id;
  const name = req.body.name;
  const description = req.body.description;
  const bucketId = req.body.bucketId;
  const script = req.body.script;
  const id = req.body.id;

  service.createDownloadTemplate(userId, id, name, description, bucketId, script, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionName: 库删除模板
 * @permissionPath: /library/remove
 * @apiName: remove
 * @apiFuncType: post
 * @apiFuncUrl: /library/remove
 * @swagger
 * /library/remove:
 *   post:
 *     description: remove template
 *     tags:
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ''
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             id:
 *               type: string
 *               example: ''
 *     responses:
 *       200:
 *         description: ''
 * */
router.post('/remove', (req, res) => {
  service.remove(req.body.id, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionName: 库更新模板信息
 * @permissionPath: /library/update
 * @apiName: update
 * @apiFuncType: post
 * @apiFuncUrl: /library/update
 * @swagger
 * /library/update:
 *   post:
 *     description: update resource from project
 *     tags:
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - id
 *          parameters:
 *            id:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: ''
 * */
router.post('/update', (req, res) => {
  service.update(req.body.id, req.body, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: 库获取模板详细信息
 * @permissionPath: /library/getDetail
 * @apiName: getDetail
 * @apiFuncType: get
 * @apiFuncUrl: /library/getDetail
 * @swagger
 * /library/getDetail:
 *   get:
 *     description: get template detail
 *     tags:
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ''
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.post('/getDetail', (req, res) => {
  service.getDetail(req.body.id, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
