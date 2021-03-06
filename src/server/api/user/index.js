/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const mediaService = require('../media/service');
const jobService = require('../job/service');
const roleService = require('../role/service');
const auditService = require('../audit/service');
const templateService = require('../template/service');

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
  const username = req.query.username || '';
  const password = req.query.password || '';

  service.login(res, username, password, (err, data) => res.json(result.json(err, data.token)));
});

const loginMiddleware = require('../../middleware/login');

router.use(loginMiddleware.middleware);

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
  service.logout(_id, res, (err, data) => res.json(result.json(err, data)), true);
});

router.get('/logout', (req, res) => {
  const _id = req.ex.userInfo._id;
  service.logout(_id, res, (err, data) => res.json(result.json(err, data)), true);
});

/**
 * @apiName: getUsers
 * @apiFuncType: get
 * @apiFuncUrl: /user/getUsers
 * @swagger
 * /user/getUsers/:
 *   get:
 *     description: 依据_ids获取用户信息
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _ids
 *         description: '带下划线的_id,多个用逗号分隔'
 *         required: false
 *         type: integer
 *         default: '2110e3b0_766c_11e7_b1e5_bfe760890b13'
 *         collectionFormat: csv
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
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *
 */
router.get('/getUsers', (req, res) => {
  const _ids = req.query._ids || '';
  service.detailUsers(_ids, (err, data) => res.json(result.json(err, data)));
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
// router.get('/auth', (req, res) => res.json(result.json(null, 'ok')));
router.get('/auth', (req, res) => {
  service.getUserInfoAndMenu(req.ex.userInfo._id, (err, data) => {
    if (err) {
      return res.json(result.fail(err));
    }
    const rs = Object.assign({
      token: loginMiddleware.getTicket(req),
      jwtToken: service.getJwtToken(),
      userInfo: data.userInfo,
      menu: data.menu,
    });

    return res.json(result.success(rs));
  });
});

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
  const pageSize = req.query.pageSize || 30;

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

/**
 * @permissionGroup: account
 * @permissionName: 同步AD账户
 * @permissionPath: /user/adAccountSync
 * @swagger
 * /user/adAccountSync:
 *   post:
 *     description: '同步AD账户'
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: '必须的字段_id,name,email'
 *         schema:
 *           type: object
 *           required:
 *             - infos
 *           properties:
 *             infos:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - _id
 *                   - name
 *                   - companyName
 *                   - email
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: ''
 *                     description: 'uuid'
 *                   name:
 *                     type: string
 *                     example: ''
 *                   companyName:
 *                     type: string
 *                     description: '公司名字'
 *                     example: '凤凰卫视'
 *                   departmentName:
 *                     type: string
 *                     description: '部门名字'
 *                     example: '信息部'
 *                   verifyType:
 *                     type: string
 *                     description: '登录验证方式, 1:域验证, 2:webos验证'
 *                     default: '1'
 *                     example: '1'
 *                   title:
 *                     type: string
 *                     example: ''
 *                     description: '职位头衔'
 *                   employeeId:
 *                     type: string
 *                     example: ''
 *                     description: '工号'
 *                   email:
 *                     type: string
 *                     example: '12345678@qq.com'
 *                     description: '邮箱'
 *                   phone:
 *                     type: string
 *                     example: ''
 *                     description: '手机号'
 *                   photo:
 *                     type: string
 *                     example: ''
 *                     description: '头像地址'
 *                   status:
 *                     type: string
 *                     example: ''
 *                     description: '0:未激活,1:正常,2:已删除.默认是1'
 *               example: [{"_id": "bbbbb", "name": "vzvzv", "companyName": "小红书", departmentName: "组织部", "verifyType": "1", "email": "bbcc@qq.com"},
 *                    {"_id": "bbbbbc", "name": "vbvb", "companyName": "小黄书", departmentName: "搜索部", "verifyType": "2", "email": "bbcd@qq.com"},
 *                     {"_id": "bbbbbd", "name": "vcvc", "companyName": "小蓝书", departmentName: "美术部", "verifyType": "1", "email": "bbce@qq.com"},
 *                    {"_id": "bbbbbe", "name": "vdvd", "companyName": "小黑书", departmentName: "组织部", "verifyType": "2", "email": "bbcf@qq.com"}]
 *     responses:
 *       200:
 *         description: UserInfo
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              description: '0表示成功,其他表示失败'
 *              example: '0'
 *            data:
 *              type: string
 *              description: '如果status是0,那么data是"ok",否则是空的object'
 *              example: 'ok'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: '如果status不是0，那么这里是出错的信息,否则是"ok"'
 *                  example: 'ok'
 */
router.post('/adAccountSync', (req, res) => {
  service.batchAdAccountSync(req.body.infos, (err, r) => res.json(result.json(err, r)));
});

/* downloadTask */
/**
 * @apiName: listJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/listJob
 * @swagger
 * /user/listJob:
 *   get:
 *     description: list task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: currentStep
 *         type: int
 *         default: 0
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: int
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: int
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: taskList
 */
router.get('/listJob', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize;
  const status = req.query.status || '';
  const currentStep = req.query.currentStep || '-1';
  const userId = req.ex.userId;
  jobService.list({ page: page * 1, pageSize: pageSize * 1, status, currentStep, userId }, (err, r) => res.json(result.json(err, r)));
});

/* downloadTask */
/**
 * @apiName: listMyAuditJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/listMyAuditJob
 * @swagger
 * /user/listMyAuditJob:
 *   get:
 *     description: list my audit job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: number
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: number
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: taskList
 */
router.get('/listMyAuditJob', (req, res) => {
  jobService.listAuditInfo(req, false, (err, r) => res.json(result.json(err, r)));
});

/* downloadTask */
/**
 * @permissionGroup: auditTask
 * @permissionName: 任务-审核任务列表
 * @permissionPath: /user/listAuditJob
 * @apiName: listAuditJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/listAuditJob
 * @swagger
 * /user/listAuditJob:
 *   get:
 *     description: list audit job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: number
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: number
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: taskList
 */
router.get('/listAuditJob', loginMiddleware.hasAccessMiddleware, (req, res) => {
  jobService.listAuditInfo(req, true, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: auditTask
 * @permissionName: 任务-审核任务通过或拒绝
 * @permissionPath: /user/passOrRejectAudit
 * @apiName: passOrRejectAudit
 * @apiFuncType: post
 * @apiFuncUrl: /user/passOrRejectAudit
 * @swagger
 * /user/passOrRejectAudit/:
 *   post:
 *     description: pass or reject audit
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - AuditInfo
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
 *         description: AuditInfo
 */
router.post('/passOrRejectAudit', loginMiddleware.hasAccessMiddleware, (req, res) => {
  auditService.passOrReject(req, (err, data) => res.json(result.json(err, data)));
});

/**
 * @apiName: queryJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/queryJob
 * @swagger
 * /user/queryJob:
 *   get:
 *     description: query download job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/queryJob', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  jobService.query({ jobId }, res);
});

/**
 * @permissionGroup: downloadTask
 * @permissionName: user_restartJob
 * @permissionPath: /user/restartJob
 * @apiName: restartJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/restartJob
 * @swagger
 * /user/restartJob:
 *   get:
 *     description: restart job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/restartJob', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  jobService.restart({ jobId, userId: req.ex.userId }, res);
});

/**
 * @apiName: stopJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/stopJob
 * @swagger
 * /user/stopJob:
 *   get:
 *     description: stop job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/stopJob', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  jobService.stop({ jobId, userId: req.ex.userId }, res);
});

/**
 * @apiName: deleteJob
 * @apiFuncType: get
 * @apiFuncUrl: /user/deleteJob
 * @swagger
 * /user/deleteJob:
 *   get:
 *     description: delete job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - UserInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         description: '支持多个删除,用逗号隔开'
 *         example: '12324,12312,124214'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/deleteJob', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  jobService.delete({ jobId, userId: req.ex.userId }, res);
});

/**
 * @apiName: directAuthorizeAcceptorList
 * @apiFuncType: get
 * @apiFuncUrl: /user/directAuthorize/acceptorList
 * @swagger
 * /user/directAuthorize/acceptorList:
 *   get:
 *     description: 获取绑定的快传账户的直传模式授权列表
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: object
 *              properties:
 *                acceptor:
 *                  type: object
 *                  description: '接收方信息'
 *                  properties:
 *                    _id:
 *                      type: string
 *                    targetType:
 *                      type: number
 *                      description: '0:个人,1:组织,2:全部'
 *                    name:
 *                      type: string
 *                      description: '依据targetType对应个人或组织名字'
 *                    avatar:
 *                      type: object
 *                      description: '头像'
 *                sender:
 *                  type: object
 *                  description: '发送方信息'
 *                  properties:
 *                    _id:
 *                      type: string
 *                    targetType:
 *                      type: number
 *                      description: '0:个人,1:组织,2:全部'
 *                    name:
 *                      type: string
 *                      description: '依据targetType对应个人或组织名字'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
router.get('/directAuthorize/acceptorList', (req, res) => {
  const _id = req.ex.userId;
  service.getDirectAuthorizeAcceptorList(_id, (err, data) => res.json(result.json(err, data)));
});

/**
 * @permissionGroup: account
 * @permissionName: 列举部门列表
 * @permissionPath: /user/listUserByDepartment
 * @apiName: listUserByDepartment
 * @apiFuncType: get
 * @apiFuncUrl: /user/listUserByDepartment
 * @swagger
 * /user/listUserByDepartment:
 *   get:
 *     description: list catalog task
 *     tags:
 *       - v1
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: ''
 *         required: false
 *         type: string
 *         default: '0'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listUserByDepartment', (req, res) => {
  const keyword = req.query.keyword || '';

  roleService.searchUserOrGroup({
    type: '0',
    keyword,
    departmentId: req.ex.userInfo.department._id,
  }, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: listUsableTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /user/listUsableTemplate
 * @swagger
 * /user/listUsableTemplate:
 *   get:
 *     description: listUsableTemplate
 *     tags:
 *       - v1
 *       - user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 * */
router.get('/listUsableTemplate', (req, res) => {
  const userInfo = req.ex.userInfo;
  const pageSize = req.query.pageSize || 99;

  templateService.listUsableTemplate(userInfo, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;
