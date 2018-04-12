'use strict';

const express = require('express');

const router = express.Router();
const isLogin = require('../../middleware/login');
const service = require('./service');
const result = require('../../common/result');

router.use(isLogin.middleware);

/**
 * @permissionGroup: apn
 * @permissionName: apnPush
 * @permissionPath: /apn/push
 * @apiName: apnPush
 * @apiFuncType: post
 * @apiFuncUrl: /apn/push
 * @swagger
 * /apn/push:
 *   post:
 *     description: 推送信息到苹果voip服务
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description:
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *             - alert
 *             - cmd
 *           properties:
 *             userId:
 *               type: string
 *             alert:
 *               type: string
 *             cmd:
 *               type: string
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
 */
router.post('/push', (req, res) => {
  service.push(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: apn
 * @permissionName: saveApnToken
 * @permissionPath: /apn/saveApnToken
 * @apiName: saveApnToken
 * @apiFuncType: post
 * @apiFuncUrl: /apn/saveApnToken
 * @swagger
 * /apn/saveApnToken:
 *   post:
 *     description: 保存apnToken
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description:
 *         schema:
 *           type: object
 *           required:
 *             - apnToken
 *             - _id
 *           properties:
 *             apnToken:
 *               type: string
 *             _id:
 *               type: string
 *               description: user _id
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
 */
router.post('/saveApnToken', (req, res) => {
  service.saveApnToken(req.body, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;

