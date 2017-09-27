/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: transcode
 * @permissionName: list
 * @permissionPath: /transcode/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /transcode/list
 * @swagger
 * /transcode/list:
 *   get:
 *     description: list transcode task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: //帧索引创建  divideFile, //文件分割 transcoding, //转码 mergeFile //文件合并
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: currentStep
 *         description: 过滤出状态为currentStep 的记录 created, //创建 dealing, //处理中 error,//错误 complete //完成
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
 *         default: 20
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/list', (req, res) => {
  const status = req.query.status;
  const currentStep = req.query.currentStep;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;

  res.set('Content-Type', 'application/json');

  service.list(status, currentStep, page * 1, pageSize * 1, res);
});

/**
 * @permissionGroup: transcode
 * @permissionName: listChildTask
 * @permissionPath: /transcode/listChildTask
 * @apiName: listChildTask
 * @apiFuncType: get
 * @apiFuncUrl: /transcode/listChildTask
 * @swagger
 * /transcode/listChildTask:
 *   get:
 *     description: list child task under main task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description: 主任务的Id
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/listChildTask', (req, res) => {
  const parentId = req.query.parentId;
  res.set('Content-Type', 'application/json');
  service.listChildTask(parentId, res);
});

/**
 * @permissionGroup: transcode
 * @permissionName: restart
 * @permissionPath: /transcode/restart
 * @apiName: restart
 * @apiFuncType: get
 * @apiFuncUrl: /transcode/restart
 * @swagger
 * /transcode/restart:
 *   get:
 *     description: restart main task or child task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description: 主任务的Id
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: childTaskId
 *         description: 子任务
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: 任务的类型，针对子任务，如果为主任务，则不需要传此参数，index || divide || transcode || merge
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/restart', (req, res) => {
  const parentId = req.query.parentId;
  const childTaskId = req.query.childTaskId;
  const type = req.query.type;

  service.restart(parentId, childTaskId, type, res);
});

/**
 * @permissionGroup: transcode
 * @permissionName: stop
 * @permissionPath: /transcode/stop
 * @apiName: stop
 * @apiFuncType: get
 * @apiFuncUrl: /transcode/stop
 * @swagger
 * /transcode/stop:
 *   get:
 *     description: stop main task or child task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description: 主任务的Id
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: childTaskId
 *         description: 子任务
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: 任务的类型，针对子任务，如果为主任务，则不需要传此参数，index || divide || transcode || merge
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/stop', (req, res) => {
  const parentId = req.query.parentId;
  const childTaskId = req.query.childTaskId;
  const type = req.query.type;

  service.stop(parentId, childTaskId, type, res);
});

module.exports = router;
