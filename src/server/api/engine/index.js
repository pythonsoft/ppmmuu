/**
 * Created by chaoningx on 2017/7/17.
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
 * @permissionGroup: engine
 * @permissionName: 列举小组
 * @permissionPath: /engine/listGroup
 * @apiName: listGroup
 * @apiFuncType: get
 * @apiFuncUrl: /engine/listGroup
 * @swagger
 * /engine/listGroup:
 *   get:
 *     description: list engine group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineGroupInfo
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
 *       - in: query
 *         name: fields
 *         description:
 *         required: false
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *       - in: query
 *         name: isIncludeChild
 *         description:
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/listGroup', (req, res) => {
  const parentId = req.query.parentId;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const fields = req.query.fields || '_id,name,description';
  const isIncludeChild = req.query.isIncludeChild === '1';

  service.listGroup(parentId, page, pageSize, '-createdTime', fields, (err, docs) => res.json(result.json(err, docs)), isIncludeChild);
});

/**
 * @permissionGroup: engine
 * @permissionName: 添加小组
 * @permissionPath: /engine/addGroup
 * @apiName: addGroup
 * @apiFuncType: post
 * @apiFuncUrl: /engine/addGroup
 * @swagger
 * /engine/addGroup:
 *   post:
 *     description: add engine group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineGroupInfo
 *     produces:
 *       - application/json
 *     parameters:
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
 *         description: EngineGroupInfo
 */
router.post('/addGroup', (req, res) => {
  const parentId = req.body.parentId;
  const name = req.body.name;

  const info = {
    parentId,
    name,
    creator: {
      _id: req.ex.userInfo._id,
      name: req.ex.userInfo.name,
    },
  };

  service.addGroup(info, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 删除分组
 * @permissionPath: /engine/removeGroup
 * @apiName: removeGroup
 * @apiFuncType: post
 * @apiFuncUrl: /engine/removeGroup
 * @swagger
 * /engine/removeGroup:
 *   post:
 *     description: remove engine group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineGroupInfo
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
 *         description: EngineGroupInfo
 */
router.post('/removeGroup', (req, res) => {
  service.deleteGroup(req.body.groupId, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 获取分组的详细信息
 * @permissionPath: /engine/getGroup
 * @apiName: getGroup
 * @apiFuncType: get
 * @apiFuncUrl: /engine/getGroup
 * @swagger
 * /engine/getGroup:
 *   get:
 *     description: get engine group detail information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineGroupInfo
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
 *         description: EngineGroupInfo
 */
router.get('/getGroup', (req, res) => {
  service.getGroup(req.query.groupId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: engine
 * @permissionName: 更新组信息
 * @permissionPath: /engine/updateGroup
 * @apiName: updateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /engine/updateGroup
 * @swagger
 * /engine/updateGroup:
 *   post:
 *     description: update engine group information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineGroupInfo
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
 *         description: EngineGroupInfo
 */
router.post('/updateGroup', (req, res) => {
  service.updateGroup(req.body.groupId, req.body, (err, doc) => res.json(result.json(err, doc)));
});

/* engine */

/**
 * @permissionGroup: engine
 * @permissionName: 引擎列表
 * @permissionPath: /engine/listEngine
 * @apiName: listEngine
 * @apiFuncType: get
 * @apiFuncUrl: /engine/listEngine
 * @swagger
 * /engine/listEngine:
 *   get:
 *     description: list engines
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: groupId
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
 *         default: 20
 *         collectionFormat: csv
 *       - in: query
 *         name: fields
 *         description:
 *         required: false
 *         type: string
 *         default: '_id,code,name,intranetIp,isTest,isVirtual,modifyTime,isInstallMonitor'
 *         collectionFormat: csv
 *       - in: query
 *         name: sort
 *         description:
 *         required: false
 *         type: string
 *         default: 'createdTime'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/listEngine', (req, res) => {
  const keyword = req.query.keyword || '';
  const groupId = req.query.groupId || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;
  const sortFields = req.query.sort || '-createdTime';
  let fieldsNeed = req.query.fields || '_id,code,name,intranetIp,isTest,isVirtual,modifyTime,isInstallMonitor,command,installProgress';
  fieldsNeed = fieldsNeed.includes('intranetIp') ? fieldsNeed : `${fieldsNeed},intranetIp`;

  service.listEngine(keyword, groupId, page, pageSize, sortFields, fieldsNeed, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: engine
 * @permissionName: 添加引擎
 * @permissionPath: /engine/addEngine
 * @apiName: addEngine
 * @apiFuncType: post
 * @apiFuncUrl: /engine/addEngine
 * @swagger
 * /engine/addEngine:
 *   post:
 *     description: add engine
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: groupId
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
 *         description: EngineGroupInfo
 */
router.post('/addEngine', (req, res) => {
  const info = req.body;

  info.creator = {
    _id: req.ex.userInfo._id,
    name: req.ex.userInfo.name,
  };

  service.addEngine(info, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 获取引擎的详细信息
 * @permissionPath: /engine/getEngine
 * @apiName: getEngine
 * @apiFuncType: get
 * @apiFuncUrl: /engine/getEngine
 * @swagger
 * /engine/getEngine:
 *   get:
 *     description: get engine information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineInfo
 */
router.get('/getEngine', (req, res) => {
  const id = req.query.id;
  const fieldsNeed = req.query.fieldsNeed;

  service.getEngine(id, fieldsNeed, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: engine
 * @permissionName: 更新引擎信息
 * @permissionPath: /engine/updateEngine
 * @apiName: updateEngine
 * @apiFuncType: post
 * @apiFuncUrl: /engine/updateEngine
 * @swagger
 * /engine/updateEngine:
 *   post:
 *     description: update engine information
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: code
 *         description:
 *         required: false,
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
 *       - in: body
 *         name: belong
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: groupId
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: area
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: isVirtual
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: isTest
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: ip
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: intranetIp
 *         description:
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: isInstallMonitor
 *         description:
 *         required: false
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
 *     responses:
 *       200:
 *         description: EngineInfo
 */
router.post('/updateEngine', (req, res) => {
  delete req.body.configuration;
  service.updateEngine(req.body._id, req.body, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 删除引擎
 * @permissionPath: /engine/removeEngine
 * @apiName: removeEngine
 * @apiFuncType: post
 * @apiFuncUrl: /engine/removeEngine
 * @swagger
 * /engine/removeEngine:
 *   post:
 *     description: remove engine
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
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
 *         description: EngineInfo
 */
router.post('/removeEngine', (req, res) => {
  service.deleteEngine(req.body.id, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 更新引擎配置信息
 * @permissionPath: /engine/updateEngineConfiguration
 * @apiName: updateEngineConfiguration
 * @apiFuncType: post
 * @apiFuncUrl: /engine/updateEngineConfiguration
 * @swagger
 * /engine/updateEngineConfiguration:
 *   post:
 *     description: update engine configuration
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - EngineInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: configuration
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineInfo
 */
router.post('/updateEngineConfiguration', (req, res) => {
  service.updateEngineConfiguration(req.body._id, req.body.configuration, req.body.ip, err => res.json(result.json(err, 'ok')));
});

/* 进程 */

/**
 * @permissionGroup: engine
 * @permissionName: 列举引擎进程
 * @permissionPath: /engine/listProcess
 * @apiName: listProcess
 * @apiFuncType: get
 * @apiFuncUrl: /engine/listProcess
 * @swagger
 * /engine/listProcess:
 *   get:
 *     description: list engine's process
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - socket request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ip
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: list engine's process
 */
router.get('/listProcess', (req, res) => {
  service.listProcess(req.query.ip, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: engine
 * @permissionName: 列举进程命令
 * @permissionPath: /engine/listAction
 * @apiName: listAction
 * @apiFuncType: get
 * @apiFuncUrl: /engine/listAction
 * @swagger
 * /engine/listAction:
 *   get:
 *     description: list process' action
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - socket request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ip
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: configProcessName
 *         description: monitor config file process name
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: list process' action
 */
router.get('/listAction', (req, res) => {
  service.listAction(req.query.ip, req.query.configProcessName, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: engine
 * @permissionName: 执行进程action操作
 * @permissionPath: /engine/emitAction
 * @apiName: emitAction
 * @apiFuncType: post
 * @apiFuncUrl: /engine/emitAction
 * @swagger
 * /engine/emitAction:
 *   post:
 *     description: emit action in engine's process
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ip
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: configProcessName
 *         description:
 *         required: true,
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: pid
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: action
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineInfo
 */
router.post('/emitAction', (req, res) => {
  service.emitAction(req.body.ip, req.body.configProcessName, req.body.pid, req.body.action, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: engine
 * @permissionName: 安装监控
 * @permissionPath: /engine/installMonitor
 * @apiName: installMonitor
 * @apiFuncType: post
 * @apiFuncUrl: /engine/installMonitor
 * @swagger
 * /engine/installMonitor:
 *   post:
 *     description: install monitor to new engine
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ip
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: username
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: password
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: --
 */
router.post('/installMonitor', (req, res) => {
  service.installMonitor(req.body.ip, req.body.username, req.body.password, err => res.json(result.json(err, 'ok')));
});

router.get('/getSysInfo', (req, res) => {
  const ips = req.query.ip ? req.query.ip.split(',') : [];
  service.getSysInfo(ips, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;
