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
 * @permissionGroup: managementFeedback
 * @permissionName: 获取单条反馈信息
 * @permissionPath: /faq/getDetail
 * @apiName: getDetail
 * @apiFuncType: get
 * @apiFuncUrl: /faq/getDetail
 * @swagger
 * /faq/getDetail:
 *   get:
 *     description: getDetail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - FaqInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FaqInfo
 */
router.get('/getDetail', isLogin.hasAccessMiddleware, (req, res) => {
  const query = {};
  query._id = req.query._id || '';
  service.getDetail(query, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @apiName: create
 * @apiFuncType: post
 * @apiFuncUrl: /faq/create
 * @swagger
 * /faq/create:
 *   post:
 *     description: create faq
 *     tags:
 *       - v1
 *       - FaqInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 必须的字段content
 *         schema:
 *           type: object
 *           required:
 *            - content
 *           properties:
 *             content:
 *               type: string
 *               example: "内容"
 *     responses:
 *       200:
 *         description: FaqInfo
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
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name, company: req.ex.userInfo.company, department: req.ex.userInfo.department };
  info.creator = creator;

  service.createFaqInfo(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: managementFeedback
 * @permissionName: 反馈信息列表
 * @permissionPath: /faq/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /faq/list
 * @swagger
 * /faq/list:
 *   get:
 *     description: get faq list
 *     tags:
 *       - v1
 *       - FaqInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         default: ""
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
 *     responses:
 *       200:
 *         description: FaqInfo
 */
router.get('/list', isLogin.hasAccessMiddleware, (req, res) => {
  service.listFaqInfo(req.query, (err, docs) =>
      res.json(result.json(err, docs)));
});
module.exports = router;
