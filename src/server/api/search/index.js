/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

/**
 * @apiName: solrSearch
 * @apiFuncType: get
 * @apiFuncUrl: /search/solrSearch
 * @swagger
 * /search/solrSearch:
 *   get:
 *     description: get solr search
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: q
 *         description: "查询参数，全部q=: ;全部包含价格：q=price:* ；内容含有中国：q=content:中国 ；查价格区间："
 *         required: true
 *         type: string
 *         default: "name:*"
 *         collectionFormat: csv
 *       - in: query
 *         name: wt
 *         description: "返回的数据类型:json,xml二选一"
 *         required: false
 *         type: string
 *         default: "json"
 *         collectionFormat: csv
 *       - in: query
 *         name: fl
 *         description: "返回字段过滤,显示部分字段,只显示价格：fl=price ;显示价格和位置：fl=price,location ;显示全部：fl=*"
 *         required: false
 *         type: string
 *         default: "name:*"
 *         collectionFormat: csv
 *       - in: query
 *         name: timeAllowed
 *         description: "查询时限,超时仅返回已查到结果(ms)"
 *         required: false
 *         type: integer
 *         collectionFormat: csv
 *       - in: query
 *         name: start
 *         description: "从第几条数据开始返回"
 *         required: false
 *         type: integer
 *         default: 0
 *         collectionFormat: csv
 *       - in: query
 *         name: sort
 *         description: "排序（变量+空格+排序方式 , 变量+空格+排序方式）,多值字段不可排序"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: rows
 *         description: "返回数量"
 *         required: false
 *         type: integer
 *         default: 10
 *         collectionFormat: csv
 *       - in: query
 *         name: omitHeader
 *         description: "是否不返回头部（查询用时等）信息，true=不返回"
 *         required: false
 *         type: boolean
 *         default: false
 *         collectionFormat: csv
 *       - in: query
 *         name: fq
 *         description: "过滤查询,如设置价格区间：fq=price:[10 TO *] ;指定位置：fq=location:0 ;可添加多个：fq=price:[10 TO *]&fq=location:0"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: echoParams
 *         description: "返回结果中包含请求的参数,可选值(explicit、all、none)"
 *         required: false
 *         type: string
 *         default: "explicit"
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
 *              properties:
 *                numFound:
 *                  type: integer
 *                  description: "查到的数目"
 *                start:
 *                  type: integer
 *                  description: "开始的位置"
 *                maxScore:
 *                  type: float
 *                  description: "权重"
 *                QTime:
 *                  type: integer
 *                  description: "查询时间(ms)"
 *                docs:
 *                  type: array
 *                  description: "查询结构数组"
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
router.get('/solrSearch', (req, res) => {
  service.solrSearch(req.query, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @apiName: getIcon
 * @apiFuncType: get
 * @apiFuncUrl: /search/getIcon
 * @swagger
 * /search/getIcon:
 *   get:
 *     description: 获取单条缩略图
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "FE1748B4-69F9-4CAB-8CC0-5EB8A35CB717"
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
 */
router.get('/getIcon', (req, res) => {
  return service.getIcon(req.query, res);
});



/**
 * @apiName: getObject
 * @apiFuncType: get
 * @apiFuncUrl: /search/getObject
 * @swagger
 * /search/getObject:
 *   get:
 *     description: 获取单条详情
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "FE1748B4-69F9-4CAB-8CC0-5EB8A35CB717"
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
router.get('/getObject', (req, res) => {
  return service.getObject(req.query, res);
});

module.exports = router;
