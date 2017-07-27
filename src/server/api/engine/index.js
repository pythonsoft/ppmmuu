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
 * @permissionName: 添加小组
 * @permissionPath: /engine/addGroup
 * @apiName: addGroup
 * @apiFuncType: post
 * @apiFuncUrl: /engine/addGroup
 * @swagger
 * /engine/addGroup:
 *   get:
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

/* engine */

/**
 * @permissionName: 引擎列表
 * @permissionPath: /engine/listEngine
 * @apiName: listEngine
 * @apiFuncType: post
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
  const fieldsNeed = req.query.fields || '_id,code,name,intranetIp,isTest,isVirtual,modifyTime,isInstallMonitor';

  service.listEngine(keyword, groupId, page, pageSize, sortFields, fieldsNeed, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 添加引擎
 * @permissionPath: /engine/addEngine
 * @apiName: addEngine
 * @apiFuncType: post
 * @apiFuncUrl: /engine/addEngine
 * @swagger
 * /engine/addEngine:
 *   get:
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
  const groupId = req.body.groupId;
  const name = req.body.name;

  const info = {
    groupId,
    name,
    creator: {
      _id: req.ex.userInfo._id,
      name: req.ex.userInfo.name,
    },
  };

  service.addEngine(info, err => res.json(result.json(err, 'ok')));
});

module.exports = router;
