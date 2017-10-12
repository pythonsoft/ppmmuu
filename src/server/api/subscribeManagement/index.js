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
 * @permissionGroup: subscribeManagement
 * @permissionName: 增加订阅公司
 * @permissionPath: /subscribeManagement/create
 * @apiName: createSubscribeInfo
 * @apiFuncType: post
 * @apiFuncUrl: /subscribeManagement/create
 * @swagger
 * /subscribeManagement/create:
 *   post:
 *     description: 增加订阅公司
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 增加订阅公司
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - companyName
 *             - subscribeType
 *             - downloadHours
 *             - periodOfUse
 *             - startTime
 *           properties:
 *             name:
 *               type: _id
 *               description: '公司_id'
 *               example: "aa"
 *             companyName:
 *               type: string
 *               description: '公司名字'
 *               example: ""
 *             subscribeType:
 *               type: array
 *               description: '订阅类型'
 *               items:
 *                 type: string
 *                 description: '0:政治,1:体育,2:娱乐'
 *               example: ['0','1']
 *             downloadHours:
 *               type: number
 *               description: '下载时长(小时)'
 *               example: '12'
 *             periodOfUse:
 *               type: number
 *               description: '使用期限(月)'
 *               example: 1
 *             startTime:
 *               type: string
 *               description: '开始使用时间'
 *               example: '2017-10-11T07:58:25.863Z'
 *     responses:
 *       200:
 *         description: SubscribeInfo
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
router.post('/create', (req, res) => {
  service.createSubscribeInfo(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: subscribeManagement
 * @permissionName: 修改订阅公司
 * @permissionPath: /subscribeManagement/update
 * @apiName: updateSubscribeInfo
 * @apiFuncType: post
 * @apiFuncUrl: /subscribeManagement/update
 * @swagger
 * /subscribeManagement/update:
 *   post:
 *     description: 修改订阅公司
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 修改订阅公司
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - subscribeType
 *             - downloadHours
 *             - periodOfUse
 *             - startTime
 *           properties:
 *             name:
 *               type: _id
 *               description: '公司_id'
 *               example: "aa"
 *             companyName:
 *               type: string
 *               description: '公司名字'
 *               example: ""
 *             subscribeType:
 *               type: array
 *               description: '订阅类型'
 *               items:
 *                 type: string
 *                 description: '0:政治,1:体育,2:娱乐'
 *               example: ['0','1']
 *             downloadHours:
 *               type: number
 *               description: '下载时长(小时)'
 *               example: '12'
 *             periodOfUse:
 *               type: number
 *               description: '使用期限(月)'
 *               example: 1
 *             startTime:
 *               type: string
 *               description: '开始使用时间'
 *               example: '2017-10-11T07:58:25.863Z'
 *     responses:
 *       200:
 *         description: SubscribeInfo
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
router.post('/update', (req, res) => {
  service.updateSubscribeInfo(req, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: subscribeManagement
 * @permissionName: 获取订阅公司详情
 * @permissionPath: /subscribeManagement/getSubscribeInfo
 * @apiName: getSubscribeInfo
 * @apiFuncType: get
 * @apiFuncUrl: /subscribeManagement/getSubscribeInfo
 * @swagger
 * /subscribeManagement/getSubscribeInfo:
 *   get:
 *     description: 获取订阅公司详情
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: 'asdasdasd'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getSubscribeInfo', (req, res) => {
  service.getSubscribeInfo(req.query, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: subscribeManagement
 * @permissionName: 订阅管理列表
 * @permissionPath: /subscribeManagement/list
 * @apiName: listSubscribeInfo
 * @apiFuncType: get
 * @apiFuncUrl: /subscribeManagement/list
 * @swagger
 * /subscribeManagement/list:
 *   get:
 *     description: 订阅管理列表
 *     tags:
 *       - v1
 *       - SubscribeInfo
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
 *       - in: query
 *         name: keyword
 *         description: ''
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         description: '0:未使用,1:使用中,2:过期'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/list', (req, res) => {
  service.listSubscribeInfo(req, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: subscribeManagement
 * @permissionName: 删除订阅公司
 * @permissionPath: /subscribeManagement/delete
 * @apiName: deleteSubscribeInfo
 * @apiFuncType: post
 * @apiFuncUrl: /subscribeManagement/delete
 * @swagger
 * /subscribeManagement/delete:
 *   post:
 *     description: 删除订阅公司
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 删除订阅公司
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               description: ''
 *               example: "aa"
 *     responses:
 *       200:
 *         description: SubscribeInfo
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
router.post('/delete', (req, res) => {
  service.deleteSubscribeInfo(req, (err, r) => res.json(result.json(err, r)));
});


/**
 * @permissionGroup: subscribeManagement
 * @permissionName: 订阅管理中搜索用户
 * @permissionPath: /subscribeManagement/searchCompany
 * @apiName: searchCompany
 * @apiFuncType: get
 * @apiFuncUrl: /subscribeManagement/searchCompany
 * @swagger
 * /subscribeManagement/searchCompany:
 *   get:
 *     description: search company
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: '公司名字'
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         description: '显示多少条'
 *         required: false
 *         type: string
 *         example: 10
 *     responses:
 *       200:
 *         description: SubscribeInfo
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
router.get('/searchCompany', (req, res) => {
  service.searchCompany(req.query, (err, docs) =>
    res.json(result.json(err, docs)));
});

module.exports = router;
