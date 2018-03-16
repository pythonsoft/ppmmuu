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
 * @permissionGroup: departmentShelf
 * @permissionName: 创建上架任务
 * @permissionPath: /shelves/createShelfTask
 * @apiName: createShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/createShelfTask
 * @swagger
 * /shelves/createShelfTask:
 *   post:
 *     description: 创建上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建上架任务
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
 *             force:
 *               type: Boolean
 *               description: '不管之前有没有上架过，强制加入'
 *               example: false
 *             fromWhere:
 *               type: string
 *               default: 'MAM'
 *               description: 'MAM,DAYANG,HK_RUKU'
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/createShelfTask', (req, res) => {
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  const department = req.ex.userInfo.department;
  const info = req.body;
  info.creator = creator;
  info.department = department;
  service.createShelfTask(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 获取任务详情
 * @permissionPath: /shelves/getShelfDetail
 * @apiName: getShelfDetail
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/getShelfDetail
 * @swagger
 * /shelves/getShelfDetail:
 *   get:
 *     description: 获取任务详情
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: 'asdasdasd'
 *         collectionFormat: csv
 *       - in: query
 *         name: fields
 *         description: 需要哪些字段
 *         required: false
 *         type: string
 *         default: '_id,name,programNO,-files'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getShelfDetail', (req, res) => {
  req.query.fields = req.query.fields || 'name,objectId,programNO,details,editorInfo';
  service.getShelfDetail(req.query, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: departmentShelf
 * @permissionName: 待认领列表
 * @permissionPath: /shelves/listDepartmentPrepareShelfTask
 * @apiName: listDepartmentPrepareShelfTask
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/listDepartmentPrepareShelfTask
 * @swagger
 * /shelves/listDepartmentPrepareShelfTask:
 *   get:
 *     description: 待认领列表
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
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
router.get('/listDepartmentPrepareShelfTask', (req, res) => {
  service.listDepartmentPrepareShelfTask(req, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 认领上架任务
 * @permissionPath: /shelves/claimShelfTask
 * @apiName: claimShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/claimShelfTask
 * @swagger
 * /shelves/claimShelfTask:
 *   post:
 *     description: 认领上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 认领上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/claimShelfTask', (req, res) => {
  service.claimShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 派发上架任务
 * @permissionPath: /shelves/assignShelfTask
 * @apiName: assignShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/assignShelfTask
 * @swagger
 * /shelves/assignShelfTask:
 *   post:
 *     description: 派发上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 派发上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *             - dealer
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             _dealer:
 *               type: object
 *               example: {_id: '', name: ''}
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/assignShelfTask', (req, res) => {
  service.assignShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 删除上架任务
 * @permissionPath: /shelves/deleteShelfTask
 * @apiName: deleteShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/deleteShelfTask
 * @swagger
 * /shelves/deleteShelfTask:
 *   post:
 *     description: 删除上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/deleteShelfTask', (req, res) => {
  service.deleteShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 部门任务全部列表
 * @permissionPath: /shelves/listDepartmentShelfTask
 * @apiName: listDepartmentShelfTask
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/listDepartmentShelfTask
 * @swagger
 * /shelves/listDepartmentShelfTask:
 *   get:
 *     description: 待认领列表
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
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
 *       - in: query
 *         name: status
 *         description: '0:待处理,1:处理中,2:已提交,3:已删除'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listDepartmentShelfTask', (req, res) => {
  service.listDepartmentAllShelfTask(req, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 我的任务列表
 * @permissionPath: /shelves/listMyselfShelfTask
 * @apiName: listMyselfShelfTask
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/listMyselfShelfTask
 * @swagger
 * /shelves/listMyselfShelfTask:
 *   get:
 *     description: 我的任务列表
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
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
 *         name: _ids
 *         description: ''
 *         required: false
 *         type: string
 *         default: '20,123,12312'
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description: ''
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         description: '0:待处理,1:处理中,2:已提交,3:已删除'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listMyselfShelfTask', (req, res) => {
  service.listMyselfShelfTask(req, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 保存上架任务
 * @permissionPath: /shelves/saveShelf
 * @apiName: saveShelf
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/saveShelf
 * @swagger
 * /shelves/saveShelf:
 *   post:
 *     description: 保存上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 保存上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - editorInfo
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             editorInfo:
 *               type: object
 *               description: ''
 *               example: {subscribeType: ShelfTaskInfo.SUBSCRIBE_TYPE.POLITIC, source: '', limit: '', cover: ''}
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/saveShelf', (req, res) => {
  service.saveShelf(req.body, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 批量保存上架任务
 * @permissionPath: /shelves/batchSaveShelf
 * @apiName: batchSaveShelf
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/batchSaveShelf
 * @swagger
 * /shelves/batchSaveShelf:
 *   post:
 *     description: 批量保存上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 批量保存上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *             - firstId
 *             - editorInfo
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa,gg"
 *             firstId:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             editorInfo:
 *               type: object
 *               description: ''
 *               example: {subscribeType: ShelfTaskInfo.SUBSCRIBE_TYPE.POLITIC, source: '', limit: '', cover: ''}
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/batchSaveShelf', (req, res) => {
  service.batchSaveShelf(req.body, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 提交上架任务
 * @permissionPath: /shelves/submitShelf
 * @apiName: submitShelf
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/submitShelf
 * @swagger
 * /shelves/submitShelf:
 *   post:
 *     description: 提交上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 提交上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - editorInfo
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             editorInfo:
 *               type: object
 *               description: ''
 *               example: {subscribeType: ShelfTaskInfo.SUBSCRIBE_TYPE.POLITIC, source: '', limit: '', cover: ''}
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/submitShelf', (req, res) => {
  const info = req.body;
  info.userInfo = req.ex.userInfo;
  service.submitShelf(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 批量提交上架任务
 * @permissionPath: /shelves/batchSubmitShelf
 * @apiName: batchSubmitShelf
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/batchSubmitShelf
 * @swagger
 * /shelves/batchSubmitShelf:
 *   post:
 *     description: 批量提交上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 批量提交上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *             - editorInfo
 *             - firstId
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa,gg"
 *             firstId:
 *               type: string
 *               description: ''
 *               example: "aa"
 *             editorInfo:
 *               type: object
 *               description: ''
 *               example: {subscribeType: ShelfTaskInfo.SUBSCRIBE_TYPE.POLITIC, source: '', limit: '', cover: ''}
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/batchSubmitShelf', (req, res) => {
  const info = req.body;
  info.userInfo = req.ex.userInfo;
  service.batchSubmitShelf(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 退回上架任务
 * @permissionPath: /shelves/sendBackShelf
 * @apiName: sendBackShelf
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/sendBackShelf
 * @swagger
 * /shelves/sendBackShelf:
 *   post:
 *     description: 退回上架任务
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 退回上架任务
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/sendBackShelf', (req, res) => {
  service.sendBackShelf(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: lineShelf
 * @permissionName: 上架管理列表
 * @permissionPath: /shelves/listLineShelfTask
 * @apiName: listLineShelfTask
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/listLineShelfTask
 * @swagger
 * /shelves/listLineShelfTask:
 *   get:
 *     description: 上架管理列表
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
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
 *       - in: query
 *         name: status
 *         description: '2:待上架,4:上架,5:下架'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listLineShelfTask', (req, res) => {
  service.listLineShelfTask(req, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: lineShelf
 * @permissionName: 上架
 * @permissionPath: /shelves/onlineShelfTask
 * @apiName: onlineShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/onlineShelfTask
 * @swagger
 * /shelves/onlineShelfTask:
 *   post:
 *     description: 上架
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 上架
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/onlineShelfTask', (req, res) => {
  service.onlineShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: lineShelf
 * @permissionName: 下架
 * @permissionPath: /shelves/offlineShelfTask
 * @apiName: offlineShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/offlineShelfTask
 * @swagger
 * /shelves/offlineShelfTask:
 *   post:
 *     description: 下架
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 下架
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/offlineShelfTask', (req, res) => {
  service.offlineShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: lineShelf
 * @permissionName: 下架再编辑
 * @permissionPath: /shelves/editShelfTaskAgain
 * @apiName: editShelfTaskAgain
 * @apiFuncType: post
 * @apiFuncUrl: /shelves/editShelfTaskAgain
 * @swagger
 * /shelves/editShelfTaskAgain:
 *   post:
 *     description: 下架再编辑
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 下架再编辑
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/editShelfTaskAgain', (req, res) => {
  service.editShelfTaskAgain(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: departmentShelf
 * @permissionName: 部门任务中搜索用户
 * @permissionPath: /shelves/searchUser
 * @apiName: searchUser
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/searchUser
 * @swagger
 * /shelves/searchUser:
 *   get:
 *     description: search user
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: group name or user name
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.get('/searchUser', (req, res) => {
  service.searchUser(req, (err, docs) =>
      res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: myShelf
 * @permissionName: 编辑任务中的订阅类型列表
 * @permissionPath: /shelves/listSubscribeType
 * @apiName: listSubscribeType
 * @apiFuncType: get
 * @apiFuncUrl: /shelves/listSubscribeType
 * @swagger
 * /shelves/listSubscribeType:
 *   get:
 *     description: 编辑任务中的订阅类型列表
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ShelfTaskInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: 关键字
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.get('/listSubscribeType', (req, res) => {
  service.listSubscribeType(req.query, (err, docs) =>
      res.json(result.json(err, docs)));
});

module.exports = router;
