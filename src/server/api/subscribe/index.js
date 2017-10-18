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

/**
 * @apiName: getSubscribeInfo
 * @apiFuncType: get
 * @apiFuncUrl: /subscribe/getSubscribeInfo
 * @swagger
 * /subscribe/getSubscribeInfo:
 *   get:
 *     description: 获取订阅公司详情
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getSubscribeInfo', (req, res) => {
  service.getSubscribeInfo(req, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @apiName: getSubscribeTypeSummary
 * @apiFuncType: get
 * @apiFuncUrl: /subscribe/getSubscribeTypeSummary
 * @swagger
 * /subscribe/getSubscribeTypeSummary:
 *   get:
 *     description: 该公司订阅类型统计
 *     tags:
 *       - v1
 *       - SubscribeInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getSubscribeTypeSummary', (req, res) => {
  service.getSubscribeTypesSummary(req, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: esSearch
 * @apiFuncType: post
 * @apiFuncUrl: /subscribe/esSearch
 * @swagger
 * /subscribe/esSearch:
 *   post:
 *     description: 订阅es搜索
 *     tags:
 *       - v1
 *       - Search
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 订阅es搜索
 *         schema:
 *           type: object
 *           properties:
 *             keyword:
 *               type: string
 *               description: 关键字搜索
 *               example: ''
 *             subscribeType:
 *               type: array
 *               items:
 *                 type: string
 *               description: 节目类型_id数组
 *               example: ['政治','娱乐','体育']
 *             FIELD323:
 *               type: array
 *               items:
 *                 type: string
 *               description: 版本
 *               example: ['播出版','素材版','配音字幕版']
 *             duration:
 *               type: string
 *               example: 'e461e2f607a9c631a37f5a2403649eb0827c7298b13489e8ee997b2b588a9cdf'
 *             sort:
 *               type: string
 *               description: '排序'
 *               example: '764a59be44d0077e719ca8f750fd3ef798e3997dcd3182ea492e1e555c1cfcf57825b4ad83665c8397477b38f985c6be'
 *             FIELD162:
 *               type: object
 *               description: '新闻日期'
 *               example: {"gte": "2004-10-16T08:52:17.200Z", "lt": "2017-10-17T08:52:17.200Z"}
 *             FIELD36:
 *               type: object
 *               description: '首播日期'
 *               example: {"gte": "2004-10-16T08:52:17.200Z", "lt": "2017-10-17T08:52:17.200Z"}
 *             start:
 *               type: number
 *               description: '从第几个开始搜索'
 *               example: 0
 *             pageSize:
 *               type: number
 *               description: '每页数量'
 *               example: 20
 *     responses:
 *       200:
 *         description: GroupInfo
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
router.post('/esSearch', (req, res) => {
  service.esSearch(req, (err, doc) => res.json(result.json(err, doc)), req.ex.userId);
});

/**
 * @apiName: getEsMediaList
 * @apiFuncType: get
 * @apiFuncUrl: /subscribe/getEsMediaList
 * @swagger
 * /subscribe/getEsMediaList:
 *   get:
 *     description: 订阅默认页
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         description: "每个分类个数"
 *         required: true
 *         type: string
 *         default: 4
 *         collectionFormat: csv
 *     responses:
 *       200:
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
 *
 */
router.get('/getEsMediaList', (req, res) => {
  service.getEsMediaList(req, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @apiName: getSubscribeSearchConfig
 * @apiFuncType: get
 * @apiFuncUrl: /subscribe/getSubscribeSearchConfig
 * @swagger
 * /subscribe/getSubscribeSearchConfig:
 *   get:
 *     description: 订阅搜索配置项
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     responses:
 *       200:
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
 *
 */
router.get('/getSubscribeSearchConfig', (req, res) => {
  service.getSubscribeSearchConfig(req, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
