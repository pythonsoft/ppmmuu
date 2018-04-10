'use strict';

const express = require('express');

const router = express.Router();
const isLogin = require('../../middleware/login');
const service = require('./service');

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
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ids
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ok
 */
router.post('/push', (req, res) => {

});

module.exports = router;

