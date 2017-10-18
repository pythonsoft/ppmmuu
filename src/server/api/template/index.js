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
 * @permissionName: addTemplateGroup
 * @permissionPath: /template/addGroup
 * @apiName: addTemplateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /template/addGroup
 * @swagger
 * /template/addGroup:
 *   post:
 *     description: add template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - TemplateGroupInfo
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
 *         description: TemplateGroupInfo
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

  service.addGroup(info, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: downloadTemplate
 * @permissionName: listTemplateGroup
 * @permissionPath: /template/listGroup
 * @apiName: listTemplateGroup
 * @apiFuncType: get
 * @apiFuncUrl: /template/listGroup
 * @swagger
 * /template/listGroup:
 *   get:
 *     description: list template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - TemplateGroupInfo
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
 *         description: TemplateGroupInfo
 */
router.get('/listGroup', (req, res) => {
  const parentId = req.query.parentId;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.listGroup(parentId, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: downloadTemplate
 * @permissionName: removeTemplateGroup
 * @permissionPath: /template/removeGroup
 * @apiName: removeTemplateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /template/removeGroup
 * @swagger
 * /template/removeGroup:
 *   post:
 *     description: remove template group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - TemplateGroupInfo
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
 *         description: TemplateGroupInfo
 */
router.post('/removeGroup', (req, res) => {
  service.deleteGroup(req.body.groupId, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: downloadTemplate
 * @permissionName: getTemplateGroup
 * @permissionPath: /template/getGroup
 * @apiName: getGroup
 * @apiFuncType: get
 * @apiFuncUrl: /template/getGroup
 * @swagger
 * /template/getGroup:
 *   get:
 *     description: get template group detail information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - TemplateGroupInfo
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
 *         description: TemplateGroupInfo
 */
router.get('/getGroup', (req, res) => {
  service.getGroup(req.query.groupId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: downloadTemplate
 * @permissionName: updateTemplateGroup
 * @permissionPath: /template/updateGroup
 * @apiName: updateTemplateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /template/updateGroup
 * @swagger
 * /template/updateGroup:
 *   post:
 *     description: update template group information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - TemplateGroupInfo
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
 *         description: TemplateGroupInfo
 */
router.post('/updateGroup', (req, res) => {
  service.updateGroup(req.body.groupId, req.body, (err, doc) => res.json(result.json(err, doc)));
});

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
 *         name: groupId
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
  const groupId = req.query.groupId || '';

  service.list(type, groupId, sortFields, fieldsNeed, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
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
 *            groupId:
 *              type: string
 *              example: ''
 *            type:
 *              type: string
 *              example: 'download: 1, download_mediaexpress: 2, default: 1'
 *            transcodeTemplates:
 *              type: string
 *              example: '[{ _id: "", name: "" }, ...] default: ""'
 *            transcodeTemplateSelector:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: template
 */
router.post('/createDownloadTemplate', (req, res) => {
  const info = req.body;
  info.creatorId = req.ex.userInfo._id;

  service.createDownloadTemplate(info, err => res.json(result.json(err, 'ok')));
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

/**
 * @permissionGroup: downloadTemplate
 * @permissionName: 下载模板中搜索用户或组织
 * @permissionPath: /template/search/userOrGroup
 * @apiName: getTemplateSearchUserOrGroup
 * @apiFuncType: get
 * @apiFuncUrl: /template/search/userOrGroup
 * @swagger
 * /template/search/userOrGroup:
 *   get:
 *     description: search user or group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - template
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description: '"0" stands for user, "1" stands for group'
 *         required: true
 *         type: string
 *       - in: query
 *         name: keyword
 *         description: group name or user name
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: template
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
router.get('/search/userOrGroup', (req, res) => {
  service.searchUserOrGroup(req.query, (err, docs) =>
      res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: downloadTemplate
 * @permissionName: 更新下载模板分组使用人信息
 * @permissionPath: /template/updateGroupUser
 * @apiName: updateGroupUser
 * @apiFuncType: post
 * @apiFuncUrl: /template/updateGroupUser
 * @swagger
 * /template/updateGroupUser:
 *   post:
 *     description: update templateGroup users
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
 *            - users
 *          parameters:
 *            id:
 *              type: string
 *              example: ''
 *            users:
 *              type: array
 *              items:
 *                type: object
 *              example: [{_id:"a",  type: 'a', name: 'a'}]
 *     responses:
 *       200:
 *         description: ''
 * */
router.post('/updateGroupUser', (req, res) => {
  service.updateTemplateGroupUsers(req.body, (err, r) => res.json(result.json(err, r)));
});
module.exports = router;
