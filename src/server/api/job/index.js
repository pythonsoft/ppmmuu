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
 * @permissionGroup: movieEditor
 * @permissionName: 下载任务
 * @permissionPath: /job/download
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
 *       - in: body
 *         name: filetypeid
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: templateId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: receiverId
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: receiverType
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: transferMode
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/download', (req, res) => {
  req.body.userInfo = req.ex.userInfo;
  req.body.isMultiDownload = false;
  service.jugeDownload(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 下载合并任务
 * @permissionPath: /job/multiDownload
 * @apiName: multiDownload
 * @apiFuncType: post
 * @apiFuncUrl: /job/multiDownload
 * @swagger
 * /job/multiDownload:
 *   get:
 *     description: multiDownload task create
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
 *         name: filename
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: templateId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: receiverId
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: receiverType
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: transferMode
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *       - in: body
 *         name: fileInfo
 *         required: true
 *         type: array
 *         description: '多个文件信息, startTime: 起始位置, endTime：结束位置'
 *         example: [{fileId: "asdas", startTime: ["00:00:05.000"], endTime: ["00:00:10.000"]}]
 *         collectionFormat: csv
 *       - in: body
 *         name: downloadParams
 *         required: false
 *         type: array
 *         description: '多个下载信息, objectid: , inpoint：起始位置, outpoint:结束位置, filename:文件名, filetypeid:文件Id, destination:目录,targetname:'
 *         example: [{objectid: "asdas", inpoint: 0, outpoint: 0, filename: '', filetypeid: '', destination: '', targetname: ''}]
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/multiDownload', (req, res) => {
  req.body.userInfo = req.ex.userInfo;
  req.body.isMultiDownload = true;
  service.jugeDownload(req.body, (err, docs) => res.json(result.json(err, docs)));
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
 * @permissionGroup: download
 * @permissionName: 下载任务列表
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
 *         name: processType
 *         type: string
 *         default: '下载流程 download, 归档入库流程 archive, 全部为空default'
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
  const status = req.query.status || '';
  const currentStep = req.query.currentStep || '-1';
  const processType = req.query.processType || '';
  const userId = req.query.userId;

  res.set('Content-Type', 'application/json');
  service.list({ page: page * 1, pageSize: pageSize * 1, status, currentStep, userId, processType }, res);
});

/**
 * @permissionGroup: transcodeTemplate
 * @permissionName: 转码模板列表
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
 * @permissionGroup: download
 * @permissionName: 下载任务详情
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
 * @permissionGroup: download
 * @permissionName: 下载任务重启
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
 * @permissionGroup: download
 * @permissionName: 下载任务停止
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
 * @permissionGroup: download
 * @permissionName: 下载任务删除
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
 *         description: '支持多个删除,用逗号隔开'
 *         example: '13213,123213,124214'
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
 * @permissionGroup: transcodeTemplate
 * @permissionName: 删除转码模板
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
 * @apiName: mediaExpressDispatch
 * @apiFuncType: get
 * @apiFuncUrl: /job/mediaExpressDispatch
 * @swagger
 * /job/mediaExpressDispatch:
 *   get:
 *     description: mediaExpressDispatch
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: distributionId
 *         type: string
 *         require: true
 *         collectionFormat: csv
 *       - in: query
 *         name: filetypeId
 *         require: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/mediaExpressDispatch', (req, res) => {
  const shelfTaskId = req.query.distributionId;
  const filetypeId = req.query.filetypeId;
  service.mediaExpressDispatch(shelfTaskId, filetypeId, (err, rs) => res.json(result.json(err, rs)));
});

module.exports = router;
