/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const service = require('./service');
const isLogin = require('../../middleware/login');
const result = require('../../common/result');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @apiName: download
 * @apiFuncType: post
 * @apiFuncUrl: /job/download
 * @swagger
 * /job/download:
 *   get:
 *     description: download task create
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: objectid
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: inpoint
 *         description:
 *         required: false
 *         type: integer
 *         default: 0
 *         collectionFormat: csv
 *       - in: body
 *         name: outpoint
 *         description:
 *         required: true
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: body
 *         name: fileName
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/download', (req, res) => {
  const objectid = req.body.objectid;
  const inpoint = req.body.inpoint || 0;
  const outpoint = req.body.outpoint;
  const filename = req.body.filename;
  const filetypeid = req.body.filetypeid;
  const templateId = req.body.templateId;

  res.set('Content-Type', 'application/json');
  service.download(req.ex.userInfo, { objectid, inpoint: inpoint * 1, outpoint: outpoint * 1, filename, filetypeid, templateId }, res);
});

/**
 * @permissionGroup: transcodeTemplate
 * @permissionName: 创建转码模板
 * @permissionPath: /job/createTemplate
 * @apiName: createTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /job/createTemplate
 * @swagger
 * /job/createTemplate:
 *   post:
 *     description: create template
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: createJson
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/createTemplate', (req, res) => {
  const template = req.body.createJson;
  res.set('Content-Type', 'application/json');
  service.createJson({ template }, res);
});

/**
 * @permissionGroup: transcodeTemplate
 * @permissionName: 更新转码模板
 * @permissionPath: /job/updateTemplate
 * @apiName: updateTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /job/updateTemplate
 * @swagger
 * /job/updateTemplate:
 *   post:
 *     description: updateTemplate
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: updateJson
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/updateTemplate', (req, res) => {
  const template = req.body.updateJson;
  res.set('Content-Type', 'application/json');
  service.updateJson({ template }, res);
});

/**
 * @permissionName: listJob
 * @permissionPath: /job/list
 * @apiName: listJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/list
 * @swagger
 * /job/list:
 *   get:
 *     description: list task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: currentStep
 *         type: int
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: int
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: int
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: taskList
 */
router.get('/list', (req, res) => {
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  const status = req.query.status;
  const currentStep = req.query.currentStep;
  const userId = req.query.userId;

  res.set('Content-Type', 'application/json');
  service.list({ page: page * 1, pageSize: pageSize * 1, status, currentStep, userId }, res);
});

/**
 * @permissionName: listTemplate
 * @permissionPath: /job/listTemplate
 * @apiName: listTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /job/listTemplate
 * @swagger
 * /job/listTemplate:
 *   get:
 *     description: list template
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         type: int
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: int
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/listTemplate', (req, res) => {
  const page = req.query.page;
  const pageSize = req.query.pageSize;

  res.set('Content-Type', 'application/json');
  service.listTemplate({ page: page * 1, pageSize: pageSize * 1 }, res);
});

/**
 * @permissionName: queryJob
 * @permissionPath: /job/query
 * @apiName: queryJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/query
 * @swagger
 * /job/query:
 *   get:
 *     description: query job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/query', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.query({ jobId }, res);
});

/**
 * @permissionName: restartJob
 * @permissionPath: /job/restart
 * @apiName: restartJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/restart
 * @swagger
 * /job/restart:
 *   get:
 *     description: restart job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/restart', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.restart({ jobId }, res);
});

/**
 * @permissionName: stopJob
 * @permissionPath: /job/stop
 * @apiName: stopJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/stop
 * @swagger
 * /job/stop:
 *   get:
 *     description: stop job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/stop', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.stop({ jobId }, res);
});

/**
 * @permissionName: deleteJob
 * @permissionPath: /job/delete
 * @apiName: deleteJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/delete
 * @swagger
 * /job/delete:
 *   get:
 *     description: delete job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/delete', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.delete({ jobId }, res);
});

/**
 * @permissionName: deleteTemplate
 * @permissionPath: /job/deleteTemplate
 * @apiName: deleteTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /job/deleteTemplate
 * @swagger
 * /job/deleteTemplate:
 *   get:
 *     description: delete
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: templateId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/deleteTemplate', (req, res) => {
  const id = req.query.templateId;
  res.set('Content-Type', 'application/json');
  service.deleteTemplate({ id }, res);
});

/**
 * @permissionName: 转码文件和传输
 * @permissionPath: /job/downloadAndTransfer
 * @apiName: downloadAndTransfer
 * @apiFuncType: post
 * @apiFuncUrl: /job/downloadAndTransfer
 * @swagger
 * /job/downloadAndTransfer:
 *   post:
 *     description: 转码文件和传输
 *     tags:
 *       - v1
 *       -
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 转码文件和传输
 *         schema:
 *           type: object
 *           required:
 *             - downloadParams
 *             - receiverId
 *             - receiverType
 *           properties:
 *             downloadParams:
 *               type: object
 *               description: 转码参数
 *               properties:
 *                 objectid:
 *                   type: string
 *                   example: aa
 *                 inpoint:
 *                   type: integer
 *                   description: '起始帧'
 *                   example: 0
 *                 outpoint:
 *                   type: integer
 *                   description: '结束帧'
 *                   example: 412435
 *                 filename:
 *                   type: string
 *                   example: adas
 *                 filetypeid:
 *                   type: string
 *                   example: asf
 *
 *             templateId:
 *               type: string
 *               description: template _id
 *               example: "frfqwrqw"
 *             receiverId:
 *               type: string
 *               description: acceptor _id
 *               example: "frfqwrqw"
 *             receiverType:
 *               type: string
 *               description: acceptor type
 *               example: 1
 *     responses:
 *       200:
 *         description: GroupInfo
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: object
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
router.post('/downloadAndTransfer', (req, res) => {
  service.downloadAndTransfer(req, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
