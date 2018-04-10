/**
 * Created by steven on 2018/4/10.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: live
 * @permissionName: 获取所有频道
 * @permissionPath: /live/channels
 * @apiName: channels
 * @apiFuncType: get
 * @apiFuncUrl: /live/channels
 * @swagger
 * /live/channels:
 *   get:
 *     description: get channels
 *     tags:
 *       - v1
 *       - live
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 * */
router.get('/channels', (req, res) => {
  service.getChannels((err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: live
 * @permissionName: 列举节目
 * @permissionPath: /live/listProgram
 * @apiName: listProgram
 * @apiFuncType: get
 * @apiFuncUrl: /live/listProgram
 * @swagger
 * /live/listProgram:
 *   get:
 *     description: list program
 *     tags:
 *       - v1
 *       - live
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: '录播 1, 直播 2'
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: time
 *         description: '日期'
 *         required: false
 *         type: string
 *         default: '2018-04-10T03:04:05.714Z 不传默认是今天'
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description: sort by this params
 *         required: false
 *         type: string
 *         default: 'materialTime.from'
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description: request only you need fields
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         description:
 *         required: false
 *         type: string
 *         default: '1'
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         description: ''
 *         required: false
 *         type: string
 *         default: '999'
 *         collectionFormat: csv

 *     responses:
 *       200:
 *         description:
 * */
router.get('/listProgram', (req, res) => {
  service.listProgram(req.query, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: live
 * @permissionName: 获取节目信息
 * @permissionPath: /live/getProgram
 * @apiName: getProgram
 * @apiFuncType: get
 * @apiFuncUrl: /live/getProgram
 * @swagger
 * /live/getProgram:
 *   get:
 *     description: getProgram
 *     tags:
 *       - v1
 *       - live
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: '节目_id'
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 * */
router.get('/getProgram', (req, res) => {
  service.getProgram(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: live
 * @permissionName: 获取直播下载链接
 * @permissionPath: /live/createDownloadUrl
 * @apiName: createDownloadUrl
 * @apiFuncType: post
 * @apiFuncUrl: /live/createDownloadUrl
 * @swagger
 * /live/createDownloadUrl:
 *   post:
 *     description: 获取直播下载链接
 *     tags:
 *       - v1
 *       - live
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 获取直播下载链接
 *         schema:
 *           type: object
 *           required:
 *             - catalogInfoId
 *             - type
 *           properties:
 *             catalogInfoId:
 *               type: string
 *               description: '节目_id'
 *             type:
 *               type: string
 *               description: '文件类型'
 *             expiredTime:
 *               type: string
 *               description: '下载链接过期时间'
 *               example: '2018-07-02T09:46:25.591Z'
 *     responses:
 *       200:
 *         description: ShelfTaskInfo
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
router.post('/createDownloadUrl', (req, res) => {
  const info = req.body;
  service.createDownloadUrl(info, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
