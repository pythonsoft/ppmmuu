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
 *               example: ""
 *             objectId:
 *               type: string
 *               description: ''
 *               example: ""
 *             status:
 *               type: string
 *               description: '待编目 0, 编目中 1, 已提交 2, 已删除 3'
 *               example: ""
 *             taskList:
 *               type: string
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
  const ownerId = req.ex.userInfo._id;
  const ownerName = req.ex.userInfo.name;
  const departmentId = req.ex.userInfo.department._id;
  const departmentName = req.ex.userInfo.department.name;

  service.createCatalogTask(req.body, ownerId, ownerName, departmentId, departmentName, (err, docs) => res.json(result.json(err, docs)));
});

/**
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

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
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

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
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

  service.listCatalogTask(status, departmentId, ownerId, assigneeId, objectId, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
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
 *             - fileId
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
 *             fileId:
 *               type: string
 *               description: catalog which file's id
 *               example: ""
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
 *             keyman:
 *               type: string
 *               description: ''
 *               example: "
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
router.post('/createCatalog', (req, res) => {
  service.createCatalog(req.ex.userInfo._id, req.ex.userInfo.name, req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
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
 *               example: "
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
 *               example: "
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
 *             - name
 *             - size
 *             - realPath
 *             - path
 *             - type
 *             - available
 *             - status
 *           properties:
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
 *               example: "
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
  service.updateFile(req.body.id, req.body, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;
