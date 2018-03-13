/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

const ProjectInfo = require('./projectInfo');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: movieEditor
 * @permissionName: 初始化编辑器
 * @permissionPath: /ivideo/init
 * @apiName: init
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/init
 * @swagger
 * /ivideo/init:
 *   get:
 *     description: init
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 *             _id string <br/>
 *             name string <br/>
 *             creatorId string <br/>
 *             createdTime date <br/>
 *             type string 我的资料根结点 '0' 其它的 '1' <br/>
 *             modifyTime date <br/>
 *             description string <br/>
 *             canRemove string 是否可以移除 可以 '1' 不可以 '0' <br/>
 *             details object
 */
router.get('/init', (req, res) => {
  const userId = req.ex.userInfo._id;
  service.ensureAccountInit(userId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 列举出项目下的资源
 * @permissionPath: /ivideo/listItem
 * @apiName: listItem
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/listItem
 * @swagger
 * /ivideo/listItem:
 *   get:
 *     description: list item
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description: '如果有parentId，那么就一定要传ownerType'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: DIRECTORY '0' SNIPPET '1',
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: ownerType
 *         description: '收录素材:1 新闻素材:2 共享素材: 3 我的素材: 4'
 *         required: false
 *         type: string
 *         default: ''
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
 *     responses:
 *       200:
 *         description:
 *           _id string <br/>
 *           name string <br/>
 *           creatorId string <br/>
 *           creator object <br/>
 *           createdTime date <br/>
 *           parentId string <br/>
 *           type string 目录 0 视频 1<br/>
 *           ownerType string 收录素材 1 新闻素材 2 共享素材 3 我的素材 4<br/>
 *           modifyTime date <br/>
 *           description string </br>
 *           snippet object 视频信息，如果为视频，则此字段不为null<br/>
 *             { thumb ''
 *             input 0
 *             output 1
 *             duration 0}
 *           details object
 *
 * */
router.get('/listItem', (req, res) => {
  const userId = req.ex.userInfo._id;
  const parentId = req.query.parentId;
  const ownerType = req.query.ownerType;
  const type = req.query.type || '';
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listItem(userId, parentId, ownerType, type, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 创建项目下的目录
 * @permissionPath: /ivideo/createDirectory
 * @apiName: createDirectory
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/createDirectory
 * @swagger
 * /ivideo/createDirectory:
 *   post:
 *     description: create directory under project
 *     tags:
 *       - v1
 *       - IVideo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description:
 *         schema:
 *          type: object
 *          required:
 *            - parentId
 *            - name
 *            - ownerType
 *          properties:
 *            parentId:
 *              type: string
 *              example: ''
 *            name:
 *              type: string
 *              example: ''
 *            ownerType:
 *              type: string
 *              description: '共享素材: 3 我的素材: 4'
 *              example: '4'
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createDirectory', (req, res) => {
  const userId = req.ex.userInfo._id;
  const ownerType = req.body.ownerType;
  service.createDirectory(userId, ownerType, req.body.name, req.body.parentId, {}, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 添加视频片断到项目中
 * @permissionPath: /ivideo/createItem
 * @apiName: createItem
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/createItem
 * @swagger
 * /ivideo/createItem:
 *   post:
 *     description: add resource to project
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - parentId
 *            - name
 *            - ownerType
 *          properties:
 *            parentId:
 *              type: string
 *              example: ''
 *            name:
 *              type: string
 *              example: ''
 *            snippet:
 *              type: object
 *              example: '{"objectId":"9FD41F4A-F42A-4118-9AC3-4A2791582799","thumb":"http://localhost:8080/media/getIcon?objectid=9FD41F4A-F42A-4118-9AC3-4A2791582799","input":0,"output":1875,"duration":1875,"fileTypeId":"040130E8-9C84-4D0B-B181-AC5B9D523EF0"}'
 *            ownerType:
 *              type: string
 *              description: '共享素材: 3 我的素材: 4'
 *              example: '4'
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createItem', (req, res) => {
  const userId = req.ex.userInfo._id;
  const ownerType = req.body.ownerType;
  service.createItem(userId, ownerType, req.body.name, req.body.parentId, req.body.snippet, {}, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 删除资源
 * @permissionPath: /ivideo/removeItem
 * @apiName: removeItem
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/removeItem
 * @swagger
 * /ivideo/removeItem:
 *   post:
 *     description: remove resource from project
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description:
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - ownerType
 *           properties:
 *             id:
 *               type: string
 *               example: ''
 *             ownerType:
 *               type: string
 *               example: ''
 *     responses:
 *       200:
 *         description: ''
 * */
router.post('/removeItem', (req, res) => {
  service.removeItem(req.body.id, req.body.ownerType, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 更新目录或资源信息
 * @permissionPath: /ivideo/updateItem
 * @apiName: updateItem
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/updateItem
 * @swagger
 * /ivideo/updateItem:
 *   post:
 *     description: update resource from project
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - id
 *            - ownerType
 *          parameters:
 *            id:
 *              type: string
 *              example: ''
 *            ownerType:
 *              type: string
 *              example: ''
 *            name:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: ''
 * */
router.post('/updateItem', (req, res) => {
  service.updateItem(req.body.id, req.body.name, req.body.details, req.body.ownerType, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 创建新的项目
 * @permissionPath: /ivideo/createProject
 * @apiName: createProject
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/createProject
 * @swagger
 * /ivideo/createProject:
 *   post:
 *     description: create new project
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - name
 *          parameters:
 *            name:
 *              type: string
 *              example: ''
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createProject', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createProject(userId, req.body.name, ProjectInfo.TYPE.PROJECT_RESOURCE, '1', (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 删除项目
 * @permissionPath: /ivideo/removeProject
 * @apiName: removeProject
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/removeProject
 * @swagger
 * /ivideo/removeProject:
 *   post:
 *     description: remove project
 *     tags:
 *       - v1
 *       - IVideo
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
router.post('/removeProject', (req, res) => {
  service.removeProject(req.body.id, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 列举出当前用户的项目
 * @permissionPath: /ivideo/listProject
 * @apiName: listProject
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/listProject
 * @swagger
 * /ivideo/listProject:
 *   get:
 *     description: list user's projects
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
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
 *     responses:
 *       200:
 *         description: ''
 * */
router.get('/listProject', (req, res) => {
  const userId = req.ex.userInfo._id;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listProject(userId, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});


/**
 * @permissionGroup: movieEditor
 * @permissionName: 复制目录或文件到另外一个目录下
 * @permissionPath: /ivideo/copy
 * @apiName: copy
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/copy
 * @swagger
 * /ivideo/copy:
 *   post:
 *     description: 复制目录或文件到另外一个目录下
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - srcIds
 *            - srcOwnerType
 *            - destId
 *            - destOwnerType
 *          properties:
 *            srcIds:
 *              type: string
 *              description: '多个用逗号隔开'
 *              example: '123,13,123'
 *            srcOwnerType:
 *              type: string
 *              example: '3'
 *            destId:
 *              type: string
 *              example: ''
 *            destOwnerType:
 *              type: string
 *              example: '4'
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/copy', (req, res) => {
  const creatorId = req.ex.userInfo._id;
  const name = req.ex.userInfo.name;
  const company = req.ex.userInfo.company;
  const department = req.ex.userInfo.department;
  const creator = { _id: creatorId, name, company, department };
  const info = req.body;
  info.creatorId = creatorId;
  info.creator = creator;
  service.copy(info, false, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: movieEditor
 * @permissionName: 移动目录或文件到另外一个目录下
 * @permissionPath: /ivideo/move
 * @apiName: move
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/move
 * @swagger
 * /ivideo/move:
 *   post:
 *     description: 移动目录或文件到另外一个目录下
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - IVideo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *          type: object
 *          required:
 *            - srcIds
 *            - srcOwnerType
 *            - destId
 *            - destOwnerType
 *          properties:
 *            srcIds:
 *              type: string
 *              description: '多个用逗号隔开'
 *              example: '123,13,123'
 *            srcOwnerType:
 *              type: string
 *              example: '3'
 *            destId:
 *              type: string
 *              example: ''
 *            destOwnerType:
 *              type: string
 *              example: '4'
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/move', (req, res) => {
  const creatorId = req.ex.userInfo._id;
  const name = req.ex.userInfo.name;
  const company = req.ex.userInfo.company;
  const department = req.ex.userInfo.department;
  const creator = { _id: creatorId, name, company, department };
  const info = req.body;
  info.creatorId = creatorId;
  info.creator = creator;
  service.copy(info, true, (err, r) => res.json(result.json(err, r)));
});
module.exports = router;
