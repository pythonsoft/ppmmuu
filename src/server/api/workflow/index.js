'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

const isLogin = require('../../middleware/login');
router.use(isLogin.middleware);

/**
 * @permissionGroup: workflow
 * @permissionName: 创建下载流程
 * @permissionPath: /workflow/instance/create
 * @apiName: workflow_instance_create
 * @apiFuncType: post
 * @apiFuncUrl: /workflow/instance/create
 * @swagger
 * /workflow/instance/create:
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
router.post('/instance/create', (req, res) => {
  service.instanceCreate(
    req.body.name,
    req.body.workflowId,
    req.body.parms,
    req.body.priority,
    (err, docs) => res.json(result.json(err, docs))
  );
});

/**
 * @permissionGroup: workflow
 * @permissionName: 获取instance信息
 * @permissionPath: /workflow/instance/detail
 * @apiName: workflow_instance_detail
 * @apiFuncType: get
 * @apiFuncUrl: /workflow/instance/detail
 * @swagger
 * /workflow/instance/detail:
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
router.get('/instance/detail', (req, res) => {
  service.instanceDetail(req.query.id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 列举instance
 * @permissionPath: /workflow/instance/list
 * @apiName: workflow_instance_list
 * @apiFuncType: get
 * @apiFuncUrl: /workflow/instance/list
 * @swagger
 *  /workflow/instance/list:
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
router.get('/instance/list', (req, res) => {
  service.instanceList(req.query.page || 1, req.query.pageSize || 20, req.query.status, '', '', (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 获取instance所有节点信息
 * @permissionPath: /workflow/instance/log/list
 * @apiName: workflow_instance_log_list
 * @apiFuncType: get
 * @apiFuncUrl: /workflow/instance/log/list
 * @swagger
 * /workflow/instance/log/list:
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
router.get('/instance/log/list', (req, res) => {
  service.instanceLogList(req.query.workflowInstanceId, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 列举工作流定义
 * @permissionPath: /workflow/definition/list
 * @apiName: workflow_definition_list
 * @apiFuncType: get
 * @apiFuncUrl: /workflow/definition/list
 * @swagger
 *  /workflow/definition/list:
 *   get:
 *     description: 列举工作流定义
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
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         default: 'hello'
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
router.get('/definition/list', (req, res) => {
  console.log('list -->', req.query);
  service.definitionList(req.query.page, req.query.pageSize, req.query.keyword, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 创建工作流定义
 * @permissionPath: /workflow/definition/create
 * @apiName: workflow_definition_create
 * @apiFuncType: post
 * @apiFuncUrl: /workflow/definition/create
 * @swagger
 * /workflow/definition/create:
 *   post:
 *     description: 创建工作流定义
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 创建工作流定义
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - definition
 *             - description
 *           properties:
 *             name:
 *               type: string
 *               description: ''
 *               example: ''
 *             definition:
 *               type: string
 *               description: ''
 *               example: ''
 *             description:
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
router.post('/definition/create', (req, res) => {
  service.definitionCreate(req.body.name, req.body.definition, req.body.description, (err, doc) => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 更新工作流定义
 * @permissionPath: /workflow/definition/update
 * @apiName: workflow_definition_update
 * @apiFuncType: post
 * @apiFuncUrl: /workflow/definition/update
 * @swagger
 * /workflow/definition/update:
 *   post:
 *     description: 更新工作流定义
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 更新工作流定义
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             id:
 *               type: string
 *               description: ''
 *               example: ''
 *             name:
 *               type: string
 *               description: ''
 *               example: ''
 *             definition:
 *               type: string
 *               description: ''
 *               example: ''
 *             description:
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
router.post('/definition/update', (req, res) => {
  service.definitionUpdate(req.body.id, req.body, (err, doc) => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: workflow
 * @permissionName: 获取工作流定义详细信息
 * @permissionPath: /workflow/definition/detail
 * @apiName: workflow_definition_detail
 * @apiFuncType: get
 * @apiFuncUrl: /workflow/definition/detail
 * @swagger
 *  /workflow/definition/detail:
 *   get:
 *     description: 列举工作流定义
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description:
 *         required: false
 *         type: string
 *         default: '1'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/definition/detail', (req, res) => {
  service.definitionDetail(req.query.id, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
