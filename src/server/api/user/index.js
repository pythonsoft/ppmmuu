/**
 * Created by steven on 17/5/5.
 */
const express = require('express');
const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

/**
 * @apiName: postUserLogin
 * @apiFuncType: post
 * @apiFuncUrl: /api/user/login
 * @swagger
 * /user/login/:
 *   post:
 *     description: login
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: user login
 *         schema:
 *           type: object
 *           required:
 *            - username
 *            - password
 *           properties:
 *             username:
 *               type: string
 *               example: xuyawen
 *             password:
 *               type: string
 *               example: "123123"
 *     responses:
 *       200:
 *         description: UserInfo
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *
 */
router.post('/login', (req, res) => {
  let username = req.body.username || '';
  let password = req.body.password || '';

  service.login(res, username, password, function(err, data){

    return res.json(result.json(err, data));
  });
});

module.exports = router;
