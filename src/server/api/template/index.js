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
 * @permissionGroup: downloadTemplate
 * @permissionName: 下载模板列表
 * @permissionPath: /template/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /template/list
 * @swagger
 * /template/list:
 *   get:
 *     description: list template
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
 * @permissionGroup: downloadTemplate
 * @permissionName: 创建下载模板
 * @permissionPath: /template/createDownloadTemplate
 * @apiName: createDownloadTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /template/createDownloadTemplate
 * @swagger
 * /template/createDownloadTemplate:
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
 * @permissionGroup: downloadTemplate
 * @permissionName: 删除下载模板
 * @permissionPath: /template/remove
 * @apiName: remove
 * @apiFuncType: post
 * @apiFuncUrl: /template/remove
 * @swagger
 * /template/remove:
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
 * @permissionGroup: downloadTemplate
 * @permissionName: 更新下载模板信息
 * @permissionPath: /template/update
 * @apiName: update
 * @apiFuncType: post
 * @apiFuncUrl: /template/update
 * @swagger
 * /template/update:
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
 * @permissionGroup: downloadTemplate
 * @permissionName: 获取下载模板详细信息
 * @permissionPath: /template/getDetail
 * @apiName: getDetail
 * @apiFuncType: get
 * @apiFuncUrl: /template/getDetail
 * @swagger
 * /template/getDetail:
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
