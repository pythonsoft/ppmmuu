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
 *             subscribeType:
 *               type: array
 *               description: 节目类型_id数组
 *               example: ['政治','娱乐','体育']
 *             match:
 *               type: array
 *               description: '条件, key:字段, value：值'
 *               example: [{key: "publish_status", value: 1}, {key: "full_text", value: "鏘鏘三人行"}]
 *             should:
 *               type: array
 *               description: '关联度, key:字段, value：值'
 *               example: [{key: "name", value: "鏘鏘三人行"}]
 *             range:
 *               type: array
 *               description: '时间范围, key:字段, gte：大于, lt: 小于'
 *               example: [{key: "f_date_162", gte: "2017-09-10T16:00:00.000Z", lt: "2017-10-24T16:00:00.000Z"}, {key: "f_date_36", gte: "2017-09-03T16:00:00.000Z", lt: "2017-10-23T16:00:00.000Z"}]
 *             source:
 *               type: string
 *               description: '需要的字段'
 *               example: "id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify,f_str_03,f_str_187"
 *             hl:
 *               type: string
 *               description: '需要高亮的字段'
 *               example: "name,program_name_cn,program_name_en,f_str_03,f_str_187"
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

module.exports = router;
