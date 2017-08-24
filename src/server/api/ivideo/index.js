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
 * @permissionName: 初始化编辑器
 * @permissionPath: /ivideo/init
 * @apiName: init
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/init
 * @swagger
 * /ivideo/init:
 *   get:
 *     description: init ivideo
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: my resource info
 **/
router.get('/init', (req, res) => {
  const userId = req.ex.userInfo._id;
  service.ensureMyResource(userId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionName: 列举出项目下的资源
 * @permissionPath: /ivideo/listItem
 * @apiName: listItem
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/listItem
 * @swagger
 * /ivideo/listItem
 *   get:
 *     description: list project resource
 *     version: 1.0.0
 *     tags:
 *       - v1
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
router.get('/listItem', (req, res) => {
  const userId = req.ex.userInfo._id;
  const parentId = req.query.parentId;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listItem(
    userId,
    parentId,
    (err, docs) => res.json(result.json(err, docs)),
    sortFields,
    fieldsNeed,
  );
});

/**
 * @permissionName: 创建项目下的目录
 * @permissionPath: /ivideo/createDirectory
 * @apiName: createDirectory
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/createDirectory
 * @swagger
 * /ivideo/createDirectory
 *   get:
 *     description: create directory under project
 *     version: 1.0.0
 *     tags:
 *       - v1
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
 *         name: name
 *         description: directory name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 */
router.post('/createDirectory', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createDirectory(
    userId,
    req.body.name,
    req.body.parentId,
    {},
    (err, r) => res.json(result.json(err, r)),
  );
});

/**
 * @permissionName: 添加视频片断到项目中
 * @permissionPath: /ivideo/createItem
 * @apiName: createItem
 * @apiFuncType: get
 * @apiFuncUrl: /ivideo/createItem
 * @swagger
 * /ivideo/createItem
 *   get:
 *     description: add resource to project
 *     version: 1.0.0
 *     tags:
 *       - v1
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
 *         name: name
 *         description: resource name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
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
 *               example: 0
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 */
router.post('/createItem', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createItem(
    userId,
    req.body.name,
    req.body.parentId,
    req.body.snippet,
    {},
    (err, r) => res.json(result.json(err, r)),
  );
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
 *     version: 1.0.0
 *     tags:
 *       - v1
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
 * @permissionName: 删除项目
 * @permissionPath: /ivideo/removeProject
 * @apiName: removeProject
 * @apiFuncType: post
 * @apiFuncUrl: /ivideo/removeProject
 * @swagger
 * /ivideo/removeProject:
 *   post:
 *     description: remove project
 *     version: 1.0.0
 *     tags:
 *       - v1
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
 * /ivideo/listProject
 *   get:
 *     description: list user's projects
 *     version: 1.0.0
 *     tags:
 *       - v1
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

  service.listProject(
    userId,
    (err, docs) => res.json(result.json(err, docs)),
    sortFields,
    fieldsNeed,
  );
});

module.exports = router;
