/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

//router.use(isLogin.middleware);
//router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName: 组列表
 * @permissionPath: /search/userOrGroup
 * @apiName: getSearchUserOrGroup
 * @apiFuncType: get
 * @apiFuncUrl: /search/userOrGroup
 * @swagger
 * /search/userOrGroup:
 *   get:
 *     description: search user or group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description: '"0" stands for user, "1" stands for group'
 *         required: true
 *         type: string
 *       - in: query
 *         name: keyword
 *         description: group name or user name
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.get('/userOrGroup', (req, res) => {
  service.searchUserOrGroup(req.query, (err, docs) =>
    res.json(result.json(err, docs)));
});

module.exports = router;
