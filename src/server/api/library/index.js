/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const extService = require('./extService');
const isLogin = require('../../middleware/login');
const xml = require('./xml');

/**
 * @swagger
 * /library/getAsyncCatalogInfoList:
 *   get:
 *     description: 获取入库编目信息
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: lastmodify
 *         description: ''
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: count
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getAsyncCatalogInfoList', (req, res) => {
  extService.getAsyncCatalogInfoList(req.query, (err, doc) => res.json(result.json(err, doc)));
});

router.get('/template/:id', (req, res) => {
  const _id = req.params.id || '';
  service.getTemplateResult(_id, '', (err, doc) => res.json(result.json(err, doc)));
});

router.get('/file/:objectId', (req, res) => {
  const objectId = req.params.objectId || '';
  service.getSourceFileAndSubtitleFile(objectId, (err, doc) => res.json(result.json(err, doc)));
});

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: library
 * @permissionName: 创建编目任务信息
 * @permissionPath: /library/createCatalogTask
 * @apiName: createCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/createCatalogTask
 * @swagger
 * /library/createCatalogTask:
 *   post:
 *     description: 创建编目任务信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建编目任务信息
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - objectId
 *           properties:
 *             name:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             objectId:
 *               type: string
 *               description: ''
 *               example: ""
 *             departmentId:
 *               type: string
 *               description: ''
 *               example: ""
 *             departmentName:
 *               type: string
 *               description: ''
 *               example: ""
 *             status:
 *               type: string
 *               description: '待编目 0, 编目中 1, 已提交 2, 已删除 3'
 *               example: ""
 *             jobs:
 *               type: object
 *               description: ''
 *               example: ""
 *             description:
 *               type: string
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/createCatalogTask', (req, res) => {
  const creatorId = req.ex.userInfo._id;
  const creatorName = req.ex.userInfo.name;
  const departmentId = req.body.departmentId || '';
  const departmentName = req.body.departmentName || '';

  service.createCatalogTask(req.body, creatorId, creatorName, departmentId, departmentName, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 更新编目任务信息
 * @permissionPath: /library/updateCatalogTask
 * @apiName: updateCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/updateCatalogTask
 * @swagger
 * /library/updateCatalogTask:
 *   post:
 *     description: 更新编目任务信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新编目任务信息
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             workflowStatus:
 *               type: string
 *               description: '等待 0, 处理中 1, 成功 2, 失败 1000'
 *               example: ""
 *             jobs:
 *               type: object
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/updateCatalogTask', (req, res) => {
  const updateDoc = {};

  if (req.body.workflowStatus) {
    updateDoc.workflowStatus = req.body.workflowStatus;
  }
  if (req.body.status) {
    updateDoc.status = req.body.status;
  }

  if (req.body.jobs) {
    updateDoc.jobs = req.body.jobs;
  }

  service.updateCatalogTask(req.body._id, updateDoc, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 列举编目任务
 * @permissionPath: /library/listCatalogTask
 * @apiName: listCatalogTask
 * @apiFuncType: get
 * @apiFuncUrl: /library/listCatalogTask
 * @swagger
 * /library/listCatalogTask:
 *   get:
 *     description: list catalog task
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: '待编目 0, 编目中 1, 已提交 2, 已删除 3'
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: departmentId
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: ownerId
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: assigneeId
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: objectId
 *         description: ''
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
 *       - in: query
 *         name: keyword
 *         description: ''
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listCatalogTask', (req, res) => {
  const status = req.query.status || '';
  const departmentId = req.query.departmentId || '';
  const ownerId = req.query.ownerId || '';
  const assigneeId = req.query.assigneeId || '';
  const objectId = req.query.objectId || '';
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;
  const keyword = req.query.keyword || '';

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, keyword, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取编目任务详细信息
 * @permissionPath: /library/getCatalogTask
 * @apiName: getCatalogTask
 * @apiFuncType: get
 * @apiFuncUrl: /library/getCatalogTask
 * @swagger
 * /library/getCatalogTask:
 *   get:
 *     description: get catalog task detail
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getCatalogTask', (req, res) => {
  const id = req.query.id || '';

  service.getCatalogTask(id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: departmentTask
 * @permissionName: 列举所在部门的编目任务
 * @permissionPath: /library/listDepartmentCatalogTask
 * @apiName: listDepartmentCatalogTask
 * @apiFuncType: get
 * @apiFuncUrl: /library/listDepartmentCatalogTask
 * @swagger
 * /library/listDepartmentCatalogTask:
 *   get:
 *     description: list department catalog task
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: '待编目 0, 编目中 1, 已提交 2, 已删除 3'
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *       - in: query
 *         name: departmentId
 *         description: ''
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
router.get('/listDepartmentCatalogTask', (req, res) => {
  const status = req.query.status || '';
  const departmentId = req.ex.userInfo.department._id;
  const ownerId = '';
  const assigneeId = '';
  const objectId = '';
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;
  const keyword = req.query.keyword || '';

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, keyword, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: personalTask
 * @permissionName: 列举我的编目任务
 * @permissionPath: /library/listMyCatalogTask
 * @apiName: listMyCatalogTask
 * @apiFuncType: get
 * @apiFuncUrl: /library/listMyCatalogTask
 * @swagger
 * /library/listMyCatalogTask:
 *   get:
 *     description: list my catalog task
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: '待编目 0, 编目中 1, 已提交 2, 已删除 3'
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
router.get('/listMyCatalogTask', (req, res) => {
  const status = req.query.status || '';
  const departmentId = '';
  const ownerId = req.ex.userInfo._id;
  const assigneeId = '';
  const objectId = '';
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;
  const keyword = req.query.keyword || '';

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, keyword, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: departmentTask
 * @permissionName: 派发任务
 * @permissionPath: /library/assignCatalogTask
 * @apiName: assignCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/assignCatalogTask
 * @swagger
 * /library/assignCatalogTask:
 *   post:
 *     description: 派发任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 派发任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *             - ownerId
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *             ownerId:
 *               type: string
 *               description: assign task to somebody
 *               example: 1
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/assignCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';
  const ownerId = req.body.ownerId || '';

  service.assignCatalogTask(taskIds, ownerId, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 认领任务
 * @permissionPath: /library/applyCatalogTask
 * @apiName: applyCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/applyCatalogTask
 * @swagger
 * /library/applyCatalogTask:
 *   post:
 *     description: 认领任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 认领任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/applyCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';

  service.applyCatalogTask(taskIds, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: personalTask
 * @permissionName: 退回任务
 * @permissionPath: /library/sendBackCatalogTask
 * @apiName: sendBackCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/sendBackCatalogTask
 * @swagger
 * /library/sendBackCatalogTask:
 *   post:
 *     description: 退回任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 退回任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/sendBackCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';

  service.sendBackCatalogTask(taskIds, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: personalTask
 * @permissionName: 提交任务
 * @permissionPath: /library/submitCatalogTask
 * @apiName: submitCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/submitCatalogTask
 * @swagger
 * /library/submitCatalogTask:
 *   post:
 *     description: 提交任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 提交任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/submitCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';

  service.submitCatalogTask(taskIds, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 删除任务
 * @permissionPath: /library/deleteCatalogTask
 * @apiName: deleteCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/deleteCatalogTask
 * @swagger
 * /library/deleteCatalogTask:
 *   post:
 *     description: 删除任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/deleteCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';

  service.deleteCatalogTask(taskIds, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: departmentTask
 * @permissionName: 恢复任务
 * @permissionPath: /library/resumeCatalogTask
 * @apiName: resumeCatalogTask
 * @apiFuncType: post
 * @apiFuncUrl: /library/resumeCatalogTask
 * @swagger
 * /library/resumeCatalogTask:
 *   post:
 *     description: 恢复任务
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 恢复任务
 *         schema:
 *           type: object
 *           required:
 *             - taskIds
 *           properties:
 *             taskIds:
 *               type: string
 *               description: task's ids which you wish
 *               example: "xxxxx or xxxx,xxxx,xxx"
 *     responses:
 *       200:
 *         description: CatalogTaskInfo
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
router.post('/resumeCatalogTask', (req, res) => {
  const taskIds = req.body.taskIds || '';

  service.resumeCatalogTask(taskIds, req.ex.userInfo._id, req.ex.userInfo.name, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取编目详细信息
 * @permissionPath: /library/getCatalog
 * @apiName: getCatalog
 * @apiFuncType: get
 * @apiFuncUrl: /library/getCatalog
 * @swagger
 * /library/getCatalog:
 *   get:
 *     description: get catalog task detail
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getCatalog', (req, res) => {
  const id = req.query.id || '';

  service.getCatalog(id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取编目任务的所有编目信息(翻译)
 * @permissionPath: /library/getCatalogInfoTranslation
 * @apiName: getCatalogInfoTranslation
 * @apiFuncType: get
 * @apiFuncUrl: /library/getCatalogInfoTranslation
 * @swagger
 * /library/getCatalogInfoTranslation:
 *   get:
 *     description: get catalogInfo translation
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectId
 *         description: 'objectId'
 *         required: true
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getCatalogInfoTranslation', (req, res) => {
  const objectId = req.query.objectId || '';
  service.getCatalogInfosTranslation(objectId, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionGroup: library
 * @permissionName: 列举编目信息
 * @permissionPath: /library/listCatalog
 * @apiName: listCatalog
 * @apiFuncType: get
 * @apiFuncUrl: /library/listCatalog
 * @swagger
 * /library/listCatalog:
 *   get:
 *     description: list catalog info
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectId
 *         description: ''
 *         required: true
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listCatalog', (req, res) => {
  const objectId = req.query.objectId || '';
  service.listCatalog(objectId, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 创建编目信息
 * @permissionPath: /library/createCatalog
 * @apiName: createCatalog
 * @apiFuncType: post
 * @apiFuncUrl: /library/createCatalog
 * @swagger
 * /library/createCatalog:
 *   post:
 *     description: 创建编目信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建编目信息
 *         schema:
 *           type: object
 *           required:
 *             - objectId
 *             - englishName
 *             - chineseName
 *             - content
 *             - source
 *             - version
 *             - keyman
 *             - language
 *             - type
 *             - inpoint
 *             - outpoint
 *             - available
 *             - materialDate
 *           properties:
 *             objectId:
 *               type: string
 *               description: ''
 *               example: ""
 *             englishName:
 *               type: string
 *               description: ''
 *               example: ""
 *             chineseName:
 *               type: string
 *               description: ''
 *               example: ""
 *             parentId:
 *               type: string
 *               description: ''
 *               example: ""
 *             keyword:
 *               type: string
 *               description: ''
 *               example: ""
 *             content:
 *               type: string
 *               description: ''
 *               example: ""
 *             source:
 *               type: string
 *               description: ''
 *               example: ""
 *             version:
 *               type: string
 *               description: ''
 *               example: ""
 *             duration:
 *               type: string
 *               description: ''
 *               example: "00:00:00:00"
 *             keyman:
 *               type: string
 *               description: ''
 *               example: ""
 *             language:
 *               type: string
 *               description: ''
 *               example: ""
 *             root:
 *               type: string
 *               description: ''
 *               example: ""
 *             type:
 *               type: string
 *               description: ''
 *               example: ""
 *             inpoint:
 *               type: string
 *               description: ''
 *               example: ""
 *             outpoint:
 *               type: string
 *               description: ''
 *               example: ""
 *             available:
 *               type: string
 *               description: ''
 *               example: ""
 *             materialDate:
 *               type: object
 *               description: ''
 *               example: { from: '2018-04-10T03:04:05.714Z', to: '2018-04-10T03:04:05.714Z' }
 *             materialTime:
 *               type: object
 *               description: ''
 *               example: { from: '2018-04-10T03:04:05.714Z', to: '2018-04-10T03:04:05.714Z' }
 *             channel:
 *               type: string
 *               description: ''
 *               example: "中文台"
 *     responses:
 *       200:
 *         description: CatalogInfo
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
router.post('/createCatalog', (req, res) => {
  const userInfo = req.ex.userInfo;
  const ownerId = req.body.ownerId || userInfo._id;
  const ownerName = req.body.ownerName || userInfo.name;
  service.createCatalog(ownerId, ownerName, req.body, (err, id) => res.json(result.json(err, id)));
});

/**
 * @permissionGroup: library
 * @permissionName: 更新编目信息
 * @permissionPath: /library/updateCatalog
 * @apiName: updateCatalog
 * @apiFuncType: post
 * @apiFuncUrl: /library/updateCatalog
 * @swagger
 * /library/updateCatalog:
 *   post:
 *     description: 更新编目信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新编目信息
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - englishName
 *             - chineseName
 *             - content
 *             - source
 *             - version
 *             - keyman
 *             - language
 *             - type
 *             - inpoint
 *             - outpoint
 *             - available
 *             - materialDate
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: ""
 *             englishName:
 *               type: string
 *               description: ''
 *               example: ""
 *             chineseName:
 *               type: string
 *               description: ''
 *               example: ""
 *             parentId:
 *               type: string
 *               description: ''
 *               example: ""
 *             keyword:
 *               type: string
 *               description: ''
 *               example: ""
 *             content:
 *               type: string
 *               description: ''
 *               example: ""
 *             source:
 *               type: string
 *               description: ''
 *               example: ""
 *             version:
 *               type: string
 *               description: ''
 *               example: ""
 *             keyman:
 *               type: string
 *               description: ''
 *               example: ""
 *             language:
 *               type: string
 *               description: ''
 *               example: ""
 *             root:
 *               type: string
 *               description: ''
 *               example: ""
 *             type:
 *               type: string
 *               description: ''
 *               example: ""
 *             inpoint:
 *               type: string
 *               description: ''
 *               example: ""
 *             outpoint:
 *               type: string
 *               description: ''
 *               example: ""
 *             available:
 *               type: string
 *               description: ''
 *               example: ""
 *             materialDate:
 *               type: string
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: CatalogInfo
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
router.post('/updateCatalog', (req, res) => {
  service.updateCatalog(req.body.id, req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 创建文件信息
 * @permissionPath: /library/createFile
 * @apiName: createFile
 * @apiFuncType: post
 * @apiFuncUrl: /library/createFile
 * @swagger
 * /library/createFile:
 *   post:
 *     description: 创建文件信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建文件信息
 *         schema:
 *           type: object
 *           required:
 *             - objectId
 *             - name
 *             - size
 *             - realPath
 *             - path
 *             - type
 *             - available
 *             - status
 *           properties:
 *             objectId:
 *               type: string
 *               description: ''
 *               example: ""
 *             name:
 *               type: string
 *               description: ''
 *               example: ""
 *             size:
 *               type: string
 *               description: ''
 *               example: ""
 *             realPath:
 *               type: string
 *               description: ''
 *               example: ""
 *             path:
 *               type: string
 *               description: ''
 *               example: ""
 *             type:
 *               type: string
 *               description: '源文件 0, 低码流 1, 字幕 2, 缩略图 3, 其它 4'
 *               example: ""
 *             available:
 *               type: string
 *               description: '不可用 0， 可用 1'
 *               example: ""
 *             status:
 *               type: string
 *               description: '未知 0, 在线 1, 在线_近线 2, 近线 3, 在线_离线 4, 离线 5'
 *               example: ""
 *             description:
 *               type: string
 *               description: ''
 *               example: ""
 *             archivePath:
 *               type: string
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: FileInfo
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
router.post('/createFile', (req, res) => {
  service.createFile(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 更新文件信息
 * @permissionPath: /library/updateFile
 * @apiName: updateFile
 * @apiFuncType: post
 * @apiFuncUrl: /library/updateFile
 * @swagger
 * /library/updateFile:
 *   post:
 *     description: 更新文件信息
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新文件信息
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - name
 *             - size
 *             - realPath
 *             - path
 *             - type
 *             - available
 *             - status
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: ""
 *             name:
 *               type: string
 *               description: ''
 *               example: ""
 *             size:
 *               type: string
 *               description: ''
 *               example: ""
 *             realPath:
 *               type: string
 *               description: ''
 *               example: ""
 *             path:
 *               type: string
 *               description: ''
 *               example: ""
 *             type:
 *               type: string
 *               description: '源文件 0, 低码流 1, 字幕 2, 缩略图 3, 其它 4'
 *               example: ""
 *             available:
 *               type: string
 *               description: '不可用 0， 可用 1'
 *               example: ""
 *             status:
 *               type: string
 *               description: '未知 0, 在线 1, 在线_近线 2, 近线 3, 在线_离线 4, 离线 5'
 *               example: ""
 *             description:
 *               type: string
 *               description: ''
 *               example: ""
 *             archivePath:
 *               type: string
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: FileInfo
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
router.post('/updateFile', (req, res) => {
  service.updateFile(req.body._id, req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取文件列表
 * @permissionPath: /library/listFile
 * @apiName: listFile
 * @apiFuncType: get
 * @apiFuncUrl: /library/listFile
 * @swagger
 * /library/listFile:
 *   get:
 *     description: get file list
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectId
 *         description: ''
 *         required: true
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listFile', (req, res) => {
  const objectId = req.query.objectId || '';

  service.listFile(objectId, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取文件详细信息
 * @permissionPath: /library/getFile
 * @apiName: getFile
 * @apiFuncType: get
 * @apiFuncUrl: /library/getFile
 * @swagger
 * /library/getFile:
 *   get:
 *     description: get catalog task detail
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getFile', (req, res) => {
  const id = req.query.id || '';

  service.getFile(id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: library
 * @permissionName: 获取文件字幕信息
 * @permissionPath: /library/getSubtitles
 * @apiName: getSubtitles
 * @apiFuncType: get
 * @apiFuncUrl: /library/getSubtitles
 * @swagger
 * /library/getSubtitles:
 *   get:
 *     description: getSubtitles
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: '视频文件_id'
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getSubtitles', (req, res) => {
  const _id = req.query._id || '';

  service.getSubtitleFile(_id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 生成入库XML文件
 * @permissionPath: /library/generateXML
 * @apiName: generateXML
 * @apiFuncType: get
 * @apiFuncUrl: /library/generateXML
 * @swagger
 * /library/generateXML:
 *   get:
 *     description: generate xml
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectId
 *         description: ''
 *         required: true
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/generateXML', (req, res) => {
  xml.create(req.query.objectId, (err, xml) => {
    if (err) {
      return res.json(result.fail(err));
    }

    return res.json(result.success(xml));
  });
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 添加入库模板
 * @permissionPath: /library/addTemplate
 * @apiName: addTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /library/addTemplate
 * @swagger
 * /library/addTemplate:
 *   post:
 *     description: 添加入库模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 添加入库模板
 *         schema:
 *           type: object
 *           required:
 *             - source
 *             - department
 *           properties:
 *             source:
 *               type: string
 *               description: ''
 *               example: ""
 *             departmentId:
 *               type: string
 *               description: ''
 *               example: ""
 *             bucketId:
 *               type: string
 *               description: '存储区_id'
 *               example: ""
 *             highTemplate:
 *               type: object
 *               description: '高码流模板'
 *               properties:
 *                 _id:
 *                   type: 'string'
 *                 name:
 *                   type: 'string'
 *               example: { _id: '', name: '' }
 *             lowTemplate:
 *               type: object
 *               description: '低码流模板'
 *               properties:
 *                 _id:
 *                   type: 'string'
 *                 name:
 *                   type: 'string'
 *               example: { _id: '', name: '' }
 *             windowsPath:
 *               type: string
 *               description: ''
 *               example: ''
 *             linuxPath:
 *               type: string
 *               description: ''
 *               example: ''
 *             highBitrateStandard:
 *               type: object
 *               description: '高码流配置'
 *               properties:
 *                 fileFomart:
 *                   type: 'string'
 *                 videoCode:
 *                   type: 'string'
 *                 bitrate:
 *                   type: 'string'
 *               example: { fileFomart: 'mxf', videoCode: 'mpeg2video', bitrate: '50000000' }
 *             lowBitrateStandard:
 *               type: object
 *               description: '低码流配置'
 *               properties:
 *                 fileFomart:
 *                   type: 'string'
 *                 videoCode:
 *                   type: 'string'
 *                 bitrate:
 *                   type: 'string'
 *               example: { fileFomart: 'mp4', videoCode: 'libx264', bitrate: '1500000' }
 *     responses:
 *       200:
 *         description: FileInfo
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
router.post('/addTemplate', (req, res) => {
  service.addTemplate(req.body, req.ex.userInfo._id, req.ex.userInfo.name, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 获取入库模板详细信息
 * @permissionPath: /library/getTemplateInfo
 * @apiName: getTemplateInfo
 * @apiFuncType: get
 * @apiFuncUrl: /library/getTemplateInfo
 * @swagger
 * /library/getTemplateInfo:
 *   get:
 *     description: 获取入库模板详细信息
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: ''
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getTemplateInfo', (req, res) => {
  service.getTemplateInfo(req.query._id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 获取入库模板信息以及根据文件选择出需要的转码模板Id
 * @permissionPath: /library/getTemplateResult
 * @apiName: getTemplateResult
 * @apiFuncType: get
 * @apiFuncUrl: /library/getTemplateResult
 * @swagger
 * /library/getTemplateResult:
 *   get:
 *     description: 获取入库模板信息以及根据文件选择出需要的转码模板Id
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: ''
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: filePath
 *         description: ''
 *         required: true
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getTemplateResult', (req, res) => {
  service.getTemplateResult(req.query._id, req.query.filePath, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 列举入库模板信息
 * @permissionPath: /library/listTemplate
 * @apiName: listTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /library/listTemplate
 * @swagger
 * /library/listTemplate:
 *   get:
 *     description: 列举入库模板信息
 *     tags:
 *       - v1
 *       - library
 *     produces:
 *       - application/json
 *     parameters:
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
router.get('/listTemplate', (req, res) => {
  const fieldsNeed = req.query.fieldsNeed || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;

  service.listTemplate(fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 删除入库模板
 * @permissionPath: /library/removeTemplate
 * @apiName: removeTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /library/removeTemplate
 * @swagger
 * /library/removeTemplate:
 *   post:
 *     description: 删除入库模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除入库模板
 *         schema:
 *           type: object
 *           required:
 *             - source
 *             - departmentId
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: ""
 *     responses:
 *       200:
 *         description: FileInfo
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
router.post('/removeTemplate', (req, res) => {
  service.removeTemplate(req.body._id, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: libraryTemplate
 * @permissionName: 更新入库模板
 * @permissionPath: /library/updateTemplate
 * @apiName: updateTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /library/updateTemplate
 * @swagger
 * /library/updateTemplate:
 *   post:
 *     description: 更新入库模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新入库模板
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: ''
 *             source:
 *               type: string
 *               description: ''
 *               example: ""
 *             departmentId:
 *               type: string
 *               description: ''
 *               example: ""
 *             bucketId:
 *               type: string
 *               description: '存储区_id'
 *               example: ""
 *             highTemplate:
 *               type: object
 *               description: '高码流模板'
 *               properties:
 *                 _id:
 *                   type: 'string'
 *                 name:
 *                   type: 'string'
 *               example: { _id: '', name: '' }
 *             lowTemplate:
 *               type: object
 *               description: '低码流模板'
 *               properties:
 *                 _id:
 *                   type: 'string'
 *                 name:
 *                   type: 'string'
 *               example: { _id: '', name: '' }
 *             windowsPath:
 *               type: string
 *               description: ''
 *               example: ''
 *             linuxPath:
 *               type: string
 *               description: ''
 *               example: ''
 *             highBitrateStandard:
 *               type: object
 *               description: '高码流配置'
 *               properties:
 *                 fileFomart:
 *                   type: 'string'
 *                 videoCode:
 *                   type: 'string'
 *                 bitrate:
 *                   type: 'string'
 *               example: { fileFomart: 'mxf', videoCode: 'mpeg2video', bitrate: '50000000' }
 *             lowBitrateStandard:
 *               type: object
 *               description: '低码流配置'
 *               properties:
 *                 fileFomart:
 *                   type: 'string'
 *                 videoCode:
 *                   type: 'string'
 *                 bitrate:
 *                   type: 'string'
 *               example: { fileFomart: 'mp4', videoCode: 'libx264', bitrate: '1500000' }
 *     responses:
 *       200:
 *         description: TemplateInfo
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
router.post('/updateTemplate', (req, res) => {
  service.updateTemplate(req.body._id, req.body, (err, r) => res.json(result.json(err, r)));
});


module.exports = router;
