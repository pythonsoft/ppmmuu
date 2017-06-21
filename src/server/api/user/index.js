/**
 * Created by steven on 17/5/5.
 */
var express = require('express');
var router = express.Router();
const Utils = require('../../common/utils');
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
 *               example: 123123
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
router.post('/login', (req, res)=> {
  let username = req.body.username || '';
  let password = req.body.password || '';
  service.login(req, res, username, password, function(err, token){
    if(err){
      return res.json(Utils.result(err.code, {}, err.message));
    }
    return res.json(Utils.result('0', {token: token}));
  })
});
module.exports = router;