/**
 * Created by steven on 17/5/5.
 */
var express = require('express');
var router = express.Router();
const Utils = require('../../common/utils');
const isLogin = require('../../middleware/login');
const Token = require('../../common/token');
const service = require('./service');

/**
 * @apiName: getUserDetail
 * @apiFuncType: get
 * @apiFuncUrl: /api/user/detail
 * @swagger
 * /user/detail:
 *   get:
 *     description: get user detail by _id
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: user _id
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: user
 */
router.get('/detail', isLogin.middleware, (req, res) => {
  return res.json(Utils.result('0', {user: "test"}));
});


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
 *       - user
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
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: user
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