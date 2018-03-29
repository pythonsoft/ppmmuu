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

router.get('/fastEditTemplate/:id', (req, res) => {
  const _id = req.params.id || '';
  service.getFastEditTemplateInfoResult(_id, (err, doc) => res.json(result.json(err, doc)));
});

router.get('/shelfTemplate/:id/', (req, res) => {
  const _id = req.params.id || '';
  const filePath = req.query.filePath || '';
  service.getShelfTemplateResult(_id, filePath, (err, doc) => res.json(result.json(err, doc)));
});

router.post('/shelves/:id/:packageStatus', (req, res) => {
  const id = req.params.id;
  const packageStatus = req.params.packageStatus;
  service.updatePackageStatus(id, packageStatus, (err, r) => res.json(result.json(err, r)));
});

router.post('/shelves', (req, res) => {
  req.body.creator = { _id: req.body.userId, name: req.body.userName };
  service.createShelfTask(req.body, (err, r) => res.json(result.json(err, r)));
});

router.post('/shelves/addFiles', (req, res) => {
  shelfService.addFilesToTask(req.body, (err, r) => res.json(result.json(err, r)));
});

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
 *          type: object
 *          required:
 *            - name
 *            - bucketId
 *          properties:
 *            name:
 *              type: string
 *              example: ''
 *            description:
 *              type: string
 *              example: ''
 *            bucketId:
 *              type: string
 *              example: ''
 *            editorTemplate:
 *              type: object
 *              description: '快编模板'
 *              example: { _id: 'dd', name: 'dd' }
 *            libraryTemplate:
 *              type: object
 *              description: '入库模板'
 *              example: { _id: 'dd', name: 'dd' }
 *            transcodeTemplates:
 *              type: array
 *              example: [{ _id: "", name: "" }]
 *            transcodeTemplateSelector:
 *              type: string
 *              description: '转码脚本'
 *              example: ''
 *            script:
 *              type: string
 *              description: '路径脚本'
 *              example: ''
 *     responses:
 *       200:
 *         description: template
 */
router.post('/addTemplate', (req, res) => {
  const info = req.body;
  info.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addTemplate(info, (err, r) => res.json(result.json(err, r)));
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
 *             - _id
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
 * @permissionPath: /shelfManage/updateTemplate
 * @apiName: updateTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/updateTemplate
 * @swagger
 * /shelfManage/updateTemplate:
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
 *             name:
 *               type: string
 *               example: ''
 *             description:
 *               type: string
 *               example: ''
 *             bucketId:
 *               type: string
 *               example: ''
 *             editorTemplate:
 *               type: object
 *               description: '快编模板'
 *               example: { _id: 'dd', name: 'dd' }
 *             libraryTemplate:
 *               type: object
 *               description: '入库模板'
 *               example: { _id: 'dd', name: 'dd' }
 *             transcodeTemplates:
 *               type: array
 *               example: [{ _id: "", name: "" }]
 *             transcodeTemplateSelector:
 *               type: string
 *               description: '转码脚本'
 *               example: ''
 *             script:
 *               type: string
 *               description: '路径脚本'
 *               example: ''
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

/**
 * @permissionGroup: fastEditTemplate
 * @permissionName: 添加快编模板
 * @permissionPath: /shelfManage/addFastEditTemplate
 * @apiName: addFastEditTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/addFastEditTemplate
 * @swagger
 * /shelfManage/addFastEditTemplate:
 *   post:
 *     description: 添加快编模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 添加快编模板
 *         schema:
 *          type: object
 *          required:
 *            - name
 *            - downloadWorkPath
 *            - transcodeWorkPath
 *            - storagePath
 *            - transcodeTemplateId
 *            - transcodeTemplateName
 *          properties:
 *            name:
 *              type: string
 *              example: ''
 *            description:
 *              type: string
 *              example: ''
 *            downloadWorkPath:
 *              type: string
 *              description: '下载路径'
 *              example: ''
 *            transcodeWorkPath:
 *              type: string
 *              description: '转码路径'
 *              example: ''
 *            storagePath:
 *              type: string
 *              description: '转存储路径'
 *              example: ''
 *            transcodeTemplateId:
 *              type: string
 *              description: '转码模板id'
 *              example: ''
 *            transcodeTemplateName:
 *              type: string
 *              description: '转码模板名字'
 *              example: ''
 *     responses:
 *       200:
 *         description: template
 */
router.post('/addFastEditTemplate', (req, res) => {
  const info = req.body;
  info.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addFastEditTemplate(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: fastEditTemplate
 * @permissionName: 获取快编模板详细信息
 * @permissionPath: /shelfManage/getFastEditTemplateInfo
 * @apiName: getFastEditTemplateInfo
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/getFastEditTemplateInfo
 * @swagger
 * /shelfManage/getFastEditTemplateInfo:
 *   get:
 *     description: 获取快编模板详细信息
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
router.get('/getFastEditTemplateInfo', (req, res) => {
  service.getFastEditTemplateInfo(req.query._id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: fastEditTemplate
 * @permissionName: 列举快编模板列表
 * @permissionPath: /shelfManage/listFastEditTemplate
 * @apiName: listFastEditTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/listFastEditTemplate
 * @swagger
 * /shelfManage/listFastEditTemplate:
 *   get:
 *     description: 列举快编模板列表
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
router.get('/listFastEditTemplate', (req, res) => {
  service.listFastEditTemplate(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: fastEditTemplate
 * @permissionName: 删除快编模板
 * @permissionPath: /shelfManage/removeFastEditTemplate
 * @apiName: removeFastEditTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/removeFastEditTemplate
 * @swagger
 * /shelfManage/removeFastEditTemplate:
 *   post:
 *     description: 删除快编模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除快编模板
 *         schema:
 *           type: object
 *           required:
 *             - _id
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
router.post('/removeFastEditTemplate', (req, res) => {
  service.removeFastEditTemplate(req.body._id, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: shelfTemplate
 * @permissionName: 更新快编模板
 * @permissionPath: /shelfManage/updateFastEditTemplate
 * @apiName: updateFastEditTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /shelfManage/updateFastEditTemplate
 * @swagger
 * /shelfManage/updateFastEditTemplate:
 *   post:
 *     description: 更新快编模板
 *     tags:
 *       - v1
 *       - library
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新快编模板
 *         schema:
 *          type: object
 *          required:
 *            - _id
 *          properties:
 *            _id:
 *              type: string
 *              example: ''
 *            name:
 *              type: string
 *              example: ''
 *            description:
 *              type: string
 *              example: ''
 *            downloadWorkPath:
 *              type: string
 *              description: '下载路径'
 *              example: ''
 *            transcodeWorkPath:
 *              type: string
 *              description: '转码路径'
 *              example: ''
 *            storagePath:
 *              type: string
 *              description: '转存储路径'
 *              example: ''
 *            transcodeTemplateId:
 *              type: string
 *              description: '转码模板id'
 *              example: ''
 *            transcodeTemplateName:
 *              type: string
 *              description: '转码模板名字'
 *              example: ''
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
router.post('/updateFastEditTemplate', (req, res) => {
  service.updateFastEditTemplate(req.body, (err, r) => res.json(result.json(err, r)));
});


/**
 * @permissionGroup: shelfList
 * @permissionName: 查看上架任务流程详情
 * @permissionPath: /shelfManage/getShelfTaskProcess
 * @apiName: getShelfTaskProcess
 * @apiFuncType: get
 * @apiFuncUrl: /shelfManage/getShelfTaskProcess
 * @swagger
 * /shelfManage/getShelfTaskProcess:
 *   get:
 *     description: 查看上架任务流程详情
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
router.get('/getShelfTaskProcess', (req, res) => {
  service.getShelfTaskProcess(req.query, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
