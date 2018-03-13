/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const shelfService = require('../shelves/service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: shelfList
 * @permissionName: 获取上架任务详情(管理)
 * @permissionPath: /shelfManage/getShelfDetail
 * @apiName: getShelfDetail
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/getShelfDetail
 * @swagger
 * /shelfManage/getShelfDetail:
 *   get:
 *     description: 获取上架任务详情
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
  shelfService.getShelfDetail(req.query, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: shelfList
 * @permissionName: 上架任务列表(管理)
 * @permissionPath: /shelfManage/listTask
 * @apiName: listShelfManageTask
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/listTask
 * @swagger
 * /shelfManage/shelfList:
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
router.get('/listTask', (req, res) => {
  service.listShelfTask(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: shelfList
 * @permissionName: 删除上架任务(管理)
 * @permissionPath: /shelfManage/deleteShelfTask
 * @apiName: deleteShelfTask
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/deleteShelfTask
 * @swagger
 * /shelfManage/deleteShelfTask:
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
  shelfService.deleteShelfTask(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: shelfTemplate
 * @permissionName: 添加上架模板
 * @permissionPath: /shelfManage/addTemplate
 * @apiName: addTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/addTemplate
 * @swagger
 * /shelfManage/addTemplate:
 *   post:
 *     description: 添加上架模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 添加上架模板
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
 * @permissionGroup: shelfTemplate
 * @permissionName: 获取上架模板详细信息
 * @permissionPath: /shelfManage/getTemplateInfo
 * @apiName: getTemplateInfo
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/getTemplateInfo
 * @swagger
 * /shelfManage/getTemplateInfo:
 *   get:
 *     description: 获取上架模板详细信息
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
 * @permissionGroup: shelfTemplate
 * @permissionName: 列举上架模板列表
 * @permissionPath: /shelfManage/listTemplate
 * @apiName: listTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/listTemplate
 * @swagger
 * /shelfManage/listTemplate:
 *   get:
 *     description: 列举上架模板列表
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
 * @permissionGroup: shelfTemplate
 * @permissionName: 删除入上架模板
 * @permissionPath: /shelfManage/removeTemplate
 * @apiName: removeTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/removeTemplate
 * @swagger
 * /shelfManage/removeTemplate:
 *   post:
 *     description: 删除入上架模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除入上架模板
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
 * @permissionGroup: shelfTemplate
 * @permissionName: 更新上架模板
 * @permissionPath: /shelfMange/updateTemplate
 * @apiName: updateTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfMange/updateTemplate
 * @swagger
 * /shelfMange/updateTemplate:
 *   post:
 *     description: 更新上架模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新上架模板
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
