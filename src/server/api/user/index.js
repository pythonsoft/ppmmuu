/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const mediaService = require('../media/service');

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

/**
 * @apiName: getSearchHistory
 * @apiFuncType: get
 * @apiFuncUrl: /user/getSearchHistory
 * @swagger
 * /user/getSearchHistory:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
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
 *         description: SearchHistoryInfo
 */
router.get('/getSearchHistory', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  mediaService.getSearchHistory(req.ex.userId, (err, docs) => res.json(result.json(err, docs)), page, pageSize);
});

/**
 * @apiName: removeSearchHistory
 * @apiFuncType: post
 * @apiFuncUrl: /user/removeSearchHistory
 * @swagger
 * /user/removeSearchHistory:
 *   post:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: remove history
 *         schema:
 *           type: object
 *           properties:
 *             ids:
 *               type: string
 *     responses:
 *       200:
 *         description: remove history
 */
router.post('/removeSearchHistory', (req, res) => {
  service.removeSearchHistory(req.body.ids, null, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: clearSearchHistory
 * @apiFuncType: post
 * @apiFuncUrl: /user/clearSearchHistory
 * @swagger
 * /user/clearSearchHistory:
 *   post:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: remove history
 */
router.post('/clearSearchHistory', (req, res) => {
  service.removeSearchHistory(null, req.ex.userId, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: getWatchHistory
 * @apiFuncType: get
 * @apiFuncUrl: /user/getWatchHistory
 * @swagger
 * /user/getWatchHistory:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
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
 *         description: WatchHistoryInfo
 */
router.get('/getWatchHistory', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  mediaService.getWatchHistory(req.ex.userId, (err, docs) => res.json(result.json(err, docs)), page, pageSize);
});

/**
 * @apiName: removeWatchHistory
 * @apiFuncType: post
 * @apiFuncUrl: /user/removeWatchHistory
 * @swagger
 * /user/removeWatchHistory:
 *   post:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: remove watch history
 *         schema:
 *           type: object
 *           properties:
 *             ids:
 *               type: string
 *     responses:
 *       200:
 *         description: remove history
 */
router.post('/removeWatchHistory', (req, res) => {
  service.removeWatchHistory(req.body.ids, null, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: clearWatchHistory
 * @apiFuncType: post
 * @apiFuncUrl: /user/clearWatchHistory
 * @swagger
 * /user/clearWatchHistory:
 *   post:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: remove history
 */
router.post('/clearWatchHistory', (req, res) => {
  service.removeWatchHistory(null, req.ex.userId, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
