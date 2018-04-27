'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

const isLogin = require('../../middleware/login');
router.use(isLogin.middleware);

/**
 * @permissionGroup: instance
 * @permissionName: 创建下载流程
 * @permissionPath: /instance/create
 * @apiName: create
 * @apiFuncType: post
 * @apiFuncUrl: /instance/create
 * @swagger
 * /instance/create:
 *   post:
 *     description: 创建下载流程
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建下载流程
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - workflowId
 *             - params
 *             - priority
 *           properties:
 *             name:
 *               type: string
 *               description: ''
 *               example: ''
 *             workflowId:
 *               type: string
 *               description: ''
 *               example: ''
 *             parms:
 *               type: string
 *               description: ''
 *               example: ''
 *             priority:
 *               type: string
 *               description: ''
 *               example: ''
 *     responses:
 *       200:
 *         description:
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
 **/
router.post('/create', (req, res) => {
  service.create(
    req.body.name,
    req.body.workflowId,
    req.body.parms,
    req.body.priority,
    (err, docs) => res.json(result.json(err, docs))
  );
});

/**
 * @permissionGroup: instance
 * @permissionName: 获取instance信息
 * @permissionPath: /instance/detail
 * @apiName: detail
 * @apiFuncType: get
 * @apiFuncUrl: /instance/detail
 * @swagger
 * /instance/detail:
 *   get:
 *     description: 获取instance信息
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description: 流程id
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/detail', (req, res) => {
  service.detail(req.query.id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: instance
 * @permissionName: 列举instance
 * @permissionPath: /instance/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl:  /instance/list
 * @swagger
 *  /instance/list:
 *   get:
 *     description: 列举instance
 *     tags:
 *       - v1
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
 *     responses:
 *       200:
 *         description:
 * */
router.get('/list', (req, res) => {
  service.detail(req.query.page || 1, req.query.pageSize || 20, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: instance
 * @permissionName: 获取instance所有节点信息
 * @permissionPath: /instance/listLog
 * @apiName: listLog
 * @apiFuncType: get
 * @apiFuncUrl: /instance/listLog
 * @swagger
 * /instance/listLog:
 *   get:
 *     description: 获取instance所有节点信息
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: workflowInstanceId
 *         description: 流程id
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listLog', (req, res) => {
  service.detail(req.query.workflowInstanceId, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
