'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');

// const isLogin = require('../../middleware/login');

// router.use(isLogin.middleware);
// router.use(isLogin.hasAccessMiddleware);

const service = require('./service');

/**
 * @permissionName: 添加配置项
 * @permissionPath: /configuration/add
 * @apiName: postAddConfig
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/add
 * @swagger
 * /configuration/add:
 *   post:
 *     description: add configuration
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add role
 *         schema:
 *           $ref: '#/definitions/ConfigurationInfo'
 *     responses:
 *       200:
 *         description: ConfigInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/add', (req, res) => {
  service.addConfig(req.body, err => res.json(result.json(err, {})));
});

/**
 * @permissionName: 更新配置项
 * @permissionPath: /configuration/update
 * @apiName: postUpdateConfig
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/update
 * @swagger
 * /configuration/update:
 *   post:
 *     description: update configuration
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update config
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
 *               type: string
 *             key:
 *               type: string
 *               example: testKey
 *             value:
 *               type: string
 *               example: testValue
 *             genre:
 *               type: string
 *               example: testGenre
 *             description:
 *               type: string
 *               example: A simple description
 *     responses:
 *       200:
 *         description: ConfigInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/update', (req, res) => {
  service.updateConfig(req.body.id, req.body, err => res.json(result.json(err, {})));
});

/**
 * @permissionName: 配置项列表
 * @permissionPath: /configuration/list
 * @apiName: getListConfig
 * @apiFuncType: get
 * @apiFuncUrl: /configuration/list
 * @swagger
 * /configuration/list:
 *   get:
 *     descrition: list configuration
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.get('/list', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;
  service.listConfig(page, pageSize, req.query.groupId, req.query.name, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 删除配置项
 * @permissionPath: /configuration/delete
 * @apiName: postDeleteConfig
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/delete
 * @swagger
 * /configuration/delete:
 *   get:
 *     description: delete configuration
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/delete', (req, res) => {
  service.deleteConfig(req.body._id, err => res.json(result.json(err, {})));
});

/**
 * @permissionName: 添加配置组
 * @permissionPath: /configuration/addGroup
 * @apiName: postAddGroup
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/addGroup
 * @swagger
 * /configuration/addGroup:
 *   post:
 *     description: add config group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationGroupInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigGroupInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/addGroup', (req, res) => {
  service.addConfigGroup(req.body, err => res.json(result.json(err, {})));
});

/**
 * @permissionName: 更新配置组
 * @permissionPath: /configuration/updateGroup
 * @apiName: postUpdateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/updateGroup
 * @swagger
 * /configuration/updateGroup:
 *   post:
 *     description: update config group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationGroupInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigGroupInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/updateGroup', (req, res) => {
  service.updateConfigGroup(req.body._id, req.body, err => res.json(result.json(err, {})));
});

/**
 * @permissionName: 配置组列表
 * @permissionPath: /configuration/listGroup
 * @apiName: getListGroup
 * @apiFuncType: get
 * @apiFuncUrl: /configuration/listGroup
 * @swagger
 * /configuration/listGroup:
 *   post:
 *     description: list config group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationGroupInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigGroupInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.get('/listGroup', (req, res) => {
  service.listConfigGroup(req.query.parent, req.query.type, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 删除配置组
 * @permissionPath: /configuration/deleteGroup
 * @apiName: postDeleteGroup
 * @apiFuncType: post
 * @apiFuncUrl: /configuration/deleteGroup
 * @swagger
 * /configuration/deleteGroup:
 *   post:
 *     description: delete config group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - ConfigurationGroupInfo
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: ConfigGroupInfo
 *         schema:
 *           $ref: '#/definitions/ResultInfo'
 */
router.post('/deleteGroup', (req, res) => {
  service.deleteConfigGroup(req.body._id, err => res.json(result.json(err, {})));
});

module.exports = router;
