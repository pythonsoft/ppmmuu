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

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: processTemplate
 * @permissionName: addProcessTemplateGroup
 * @permissionPath: /processTemplate/addGroup
 * @apiName: addGroup
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/addGroup
 * @swagger
 * /processTemplate/addGroup:
 *   post:
 *     description: add process template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: parentId
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: name
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.post('/addGroup', (req, res) => {
  const parentId = req.body.parentId;
  const name = req.body.name;
  const _id = req.body.id;

  const info = {
    parentId,
    name,
    creator: {
      _id: req.ex.userInfo._id,
      name: req.ex.userInfo.name,
    },
    _id,
  };

  service.addGroup(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: listProcessTemplateGroup
 * @permissionPath: /processTemplate/listGroup
 * @apiName: listGroup
 * @apiFuncType: get
 * @apiFuncUrl: /processTemplate/listGroup
 * @swagger
 * /processTemplate/listGroup:
 *   get:
 *     description: list process template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description:
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
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.get('/listGroup', (req, res) => {
  const parentId = req.query.parentId;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.listGroup(parentId, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: removeProcessTemplateGroup
 * @permissionPath: /processTemplate/removeGroup
 * @apiName: removeGroup
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/removeGroup
 * @swagger
 * /processTemplate/removeGroup:
 *   post:
 *     description: remove template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: groupId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.post('/removeGroup', (req, res) => {
  service.deleteGroup(req.body.groupId, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: getProcessTemplateGroup
 * @permissionPath: /processTemplate/getGroup
 * @apiName: getGroup
 * @apiFuncType: get
 * @apiFuncUrl: /processTemplate/getGroup
 * @swagger
 * /processTemplate/getGroup:
 *   get:
 *     description: get template group detail information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: groupId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.get('/getGroup', (req, res) => {
  service.getGroup(req.query.groupId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: updateProcessTemplateGroup
 * @permissionPath: /processTemplate/updateGroup
 * @apiName: updateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/updateGroup
 * @swagger
 * /processTemplate/updateGroup:
 *   post:
 *     description: update process template group information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: groupId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: name
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: description
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: deleteDeny
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.post('/updateGroup', (req, res) => {
  service.updateGroup(req.body.groupId, req.body, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: 流程模板列表
 * @permissionPath: /processTemplate/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /processTemplate/list
 * @swagger
 * /processTemplate/list:
 *   get:
 *     description: list process template
 *     tags:
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: groupId
 *         description:
 *         required: false
 *         type: string
 *         default: '12312'
 *         collectionFormat: csv
 *       - in: query
 *         name: groupName
 *         description:
 *         required: false
 *         type: string
 *         default: '测试'
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
  const groupId = req.query.groupId || '';
  const groupName = req.query.groupName || '';

  service.list(type, groupId, groupName, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: 创建流程模板
 * @permissionPath: /processTemplate/createTemplate
 * @apiName: createTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/createTemplate
 * @swagger
 * /processTemplate/createTemplate:
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
 *            processId:
 *              type: string
 *              example: ''
 *            groupId:
 *              type: string
 *              example: ''
 *            templateType:
 *              type: string
 *              example: '快编: 1, 入库: 2, 上架: 3'
 *            templateId:
 *              type: string
 *              example: ''
 *            templateName:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: template
 */
router.post('/createTemplate', (req, res) => {
  const info = req.body;
  info.creatorId = req.ex.userInfo._id;

  service.createTemplate(info, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: 删除流程模板
 * @permissionPath: /processTemplate/remove
 * @apiName: remove
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/remove
 * @swagger
 * /processTemplate/remove:
 *   post:
 *     description: remove process template
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
 * @permissionGroup: processTemplate
 * @permissionName: 更新流程模板信息
 * @permissionPath: /processTemplate/update
 * @apiName: update
 * @apiFuncType: post
 * @apiFuncUrl: /processTemplate/update
 * @swagger
 * /processTemplate/update:
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
  service.update(req.body._id, req.body, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: processTemplate
 * @permissionName: 获取流程模板详细信息
 * @permissionPath: /processTemplate/getDetail
 * @apiName: getDetail
 * @apiFuncType: get
 * @apiFuncUrl: /processTemplate/getDetail
 * @swagger
 * /processTemplate/getDetail:
 *   get:
 *     description: get process template detail
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

/**
 * @permissionGroup: processTemplate
 * @permissionName: getTemplateListByType
 * @permissionPath: /processTemplate/getTemplateListByType
 * @apiName: getTemplateListByType
 * @apiFuncType: get
 * @apiFuncUrl: /processTemplate/getTemplateListByType
 * @swagger
 * /processTemplate/getTemplateListByType:
 *   get:
 *     description: get template list by type
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ProcessTemplateGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ProcessTemplateGroupInfo
 */
router.get('/getTemplateListByType', (req, res) => {
  extService.getTemplateListByType(req.query, (err, doc) => res.json(result.json(err, doc)));
});


module.exports = router;
