/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

/**
 * @apiName: postUserLogin
 * @apiFuncType: post
 * @apiFuncUrl: /user/login
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
 *             - username
 *             - password
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
  const username = req.body.username || '';
  const password = req.body.password || '';

  service.login(res, username, password, (err, data) => res.json(result.json(err, data)));
});

/**
 * @apiName: getToken
 * @apiFuncType: get
 * @apiFuncUrl: /user/getToken
 * @swagger
 * /user/getToken/:
 *   get:
 *     description: getToken
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: query
 *         description: user login
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - password
 *           properties:
 *             username:
 *               type: string
 *               example: "xuyawen"
 *             password:
 *               type: string
 *               example: "123123"
 *     responses:
 *       200:
 *         description: token
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: string
 *              example: ''
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *
 */
router.get('/getToken', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  service.getToken(res, username, password, (err, token) => res.json(result.json(err, token)));
});

const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);

/**
 * @apiName: postUserUpdate
 * @apiFuncType: post
 * @apiFuncUrl: /user/update
 * @swagger
 * /user/update/:
 *   post:
 *     description: 个人中心
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: user update
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "xuyawen"
 *             displayName:
 *               type: string
 *               example: "steven"
 *             photo:
 *               type: string
 *               example: ""
 *             phone:
 *               type: string
 *               example: "18719058667"
 *             email:
 *               type: string
 *               example: "xuyawen@phoenixtv.com"
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
router.post('/update', (req, res) => {
  const _id = req.ex.userInfo._id;
  service.updateUser(_id, req.body, (err, data) => res.json(result.json(err, data)));
});


/**
 * @apiName: getUserDetail
 * @apiFuncType: get
 * @apiFuncUrl: /user/detail
 * @swagger
 * /user/detail:
 *   get:
 *     description: get user detail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/detail', (req, res) => {
  const _id = req.ex.userInfo._id;
  service.getUserDetail(_id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @apiName: postUserLogout
 * @apiFuncType: post
 * @apiFuncUrl: /user/logout
 * @swagger
 * /user/logout/:
 *   post:
 *     description: 退出登录
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: user logout
 *         schema:
 *           type: object
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
router.post('/logout', (req, res) => {
  const _id = req.ex.userInfo._id;
  service.logout(_id, res, (err, data) => res.json(result.json(err, data)));
});

router.get('/logout', (req, res) => {
  const _id = req.ex.userInfo._id;
  service.logout(_id, res, (err, data) => res.json(result.json(err, data)));
});

/**
 * @apiName: getUserAuth
 * @apiFuncType: get
 * @apiFuncUrl: /user/auth
 * @swagger
 * /user/auth/:
 *   get:
 *     description: 获取登录状态
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
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
router.get('/auth', (req, res) => res.json(result.json(null, 'ok')));

/**
 * @apiName: postUserChangePassword
 * @apiFuncType: post
 * @apiFuncUrl: /user/changePassword
 * @swagger
 * /user/changePassword/:
 *   post:
 *     description: 修改密码
 *     tags:
 *       - v1
 *       - UserInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: change password
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               example: "123123"
 *             newPassword:
 *               type: string
 *               example: "123456"
 *             confirmNewPassword:
 *               type: string
 *               example: "123456"
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
router.post('/changePassword', (req, res) => {
  const _id = req.ex.userInfo._id;
  req.body._id = _id;
  service.changePassword(req.body, res, (err, data) => res.json(result.json(err, data)));
});


module.exports = router;
