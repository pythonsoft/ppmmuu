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
 *         description:
 *         required: true
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
 *           createdTime date <br/>
 *           parentId string <br/>
 *           type string 目录 0 视频 1<br/>
 *           modifyTime date <br/>
 *           description string </br>
 *           snippet object 视频信息，如果为视频，则此字段不为null<br/>
 *             { thumb ''
 *             input 0
 *             output 1
 *             duration 0}
 *           details object
 *
 **/
router.get('/listItem', (req, res) => {
  const userId = req.ex.userInfo._id;
  const parentId = req.query.parentId;
  const type = req.query.type || '';
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listItem(userId, parentId, type, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});

/**
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
 *         name: parentId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: name
 *         description: directory name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createDirectory', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createDirectory(userId, req.body.name, req.body.parentId, {}, (err, r) => res.json(result.json(err, r)));
});

/**
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
 *         name: parentId
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: name
 *         description: resource name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: snippet
 *         description: resource info
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - thumb
 *             - input
 *             - output
 *             - duration
 *           properties:
 *             thumb:
 *               type: string
 *               example: "base64/image..."
 *             input:
 *               type: number
 *               example: 0
 *             output:
 *               type: number
 *               example: 1
 *             duration:
 *               type: number
 *               example: 0，
 *             objectId:
 *               type: string
 *               example:
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createItem', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createItem(userId, req.body.name, req.body.parentId, req.body.snippet, {}, (err, r) => res.json(result.json(err, r)));
});

/**
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
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 **/
router.post('/removeItem', (req, res) => {
  service.removeItem(req.body.id, (err, r) => res.json(result.json(err, r)));
});

/**
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
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: name
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 **/
router.post('/updateItem', (req, res) => {
  service.updateItem(req.body.id, req.body.name, req.body.details, (err, r) => res.json(result.json(err, r)));
});

/**
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
 *         name: name
 *         description: resource name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: IVideo
 */
router.post('/createProject', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createProject(userId, req.body.name, ProjectInfo.TYPE.PROJECT_RESOURCE, '1', (err, docs) => res.json(result.json(err, docs)));
});

/**
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
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 **/
router.post('/removeProject', (req, res) => {
  service.removeProject(req.body.id, (err, r) => res.json(result.json(err, r)));
});

/**
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
 **/
router.get('/listProject', (req, res) => {
  const userId = req.ex.userInfo._id;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listProject(userId, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});

module.exports = router;
