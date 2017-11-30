/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

const logger = require('../../common/log')('error');

router.use(isLogin.middleware);

/**
 * @permissionGroup: mediaCenter
 * @permissionName: 媒体库搜索
 * @permissionPath: /media/esSearch
 * @apiName: esSearch
 * @apiFuncType: post
 * @apiFuncUrl: /media/esSearch
 * @swagger
 * /media/esSearch:
 *   post:
 *     description: 媒体库es搜索
 *     tags:
 *       - v1
 *       - Search
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 媒体库es搜索
 *         schema:
 *           type: object
 *           properties:
 *             match:
 *               type: array
 *               description: '条件, key:字段, value：值'
 *               example: [{key: "publish_status", value: 1}, {key: "program_type", value: ["广告","素材"]}]
 *             should:
 *               type: array
 *               description: '关联度, key:字段, value：值'
 *               example: [{key: "name", value: "鏘鏘三人行"}]
 *             range:
 *               type: array
 *               description: '时间范围, key:字段, gte：大于, lt: 小于'
 *               example: [{key: "f_date_162", gte: "2017-09-10T16:00:00.000Z", lt: "2017-10-24T16:00:00.000Z"}, {key: "f_date_36", gte: "2017-09-03T16:00:00.000Z", lt: "2017-10-23T16:00:00.000Z"}]
 *             source:
 *               type: string
 *               description: '需要的字段'
 *               example: "id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify,f_str_03,f_str_187"
 *             hl:
 *               type: string
 *               description: '需要高亮的字段'
 *               example: "name,program_name_cn,program_name_en,f_str_03,f_str_187"
 *             start:
 *               type: number
 *               description: '从第几个开始搜索'
 *               example: 0
 *             pageSize:
 *               type: number
 *               description: '每页数量'
 *               example: 20
 *             isRelated:
 *               type: boolean
 *               description: '是否是搜索相关视频'
 *               example: false
 *     responses:
 *       200:
 *         description: GroupInfo
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
router.post('/esSearch', isLogin.hasAccessMiddleware, (req, res) => {
  service.esSearch(req.body, (err, doc) => {
    if (err) {
      return res.json(result.fail(err));
    }
    return res.json(result.success(doc));
  }, req.ex.userId);
});

/**
 * 用于mobile
 * @permissionGroup: mediaCenter
 * @permissionName: 媒体库搜索默认页
 * @permissionPath: /media/getEsMediaList
 * @apiName: getEsMediaList
 * @apiFuncType: get
 * @apiFuncUrl: /media/getEsMediaList
 * @swagger
 * /media/getEsMediaList:
 *   get:
 *     description: 获取媒体库手机版首页
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         description: "每个分类个数"
 *         required: true
 *         type: string
 *         default: 4
 *         collectionFormat: csv
 *     responses:
 *       200:
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
router.get('/getEsMediaList', isLogin.hasAccessMiddleware, (req, res) => {
  service.getCacheEsMediaList(req.query, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: mediaCenter
 * @permissionName: 媒体库搜索手机版首页
 * @permissionPath: /media/defaultMedia
 * @apiName: defaultMedia
 * @apiFuncType: get
 * @apiFuncUrl: /media/defaultMedia
 * @swagger
 * /media/defaultMedia:
 *   get:
 *     description: 获取媒体库手机版首页
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Media
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: size
 *         description: "每个分类个数"
 *         required: true
 *         type: string
 *         default: 10
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: defaultmedia list
 */

router.get('/defaultMedia', (req, res) => {
  service.defaultMediaList((err, r) => res.json(result.json(err, r)), req.ex.userId, (req.query.size || 10) * 1);
});

/**
 * @apiName: getSearchConfig
 * @apiFuncType: get
 * @apiFuncUrl: /media/getSearchConfig
 * @swagger
 * /media/getSearchConfig:
 *   get:
 *     description: 获取媒体库搜索配置
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     responses:
 *       200:
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
router.get('/getSearchConfig', (req, res) => {
  service.getSearchConfig((err, doc) => res.json(result.json(err, doc)));
});

/**
 * @apiName: getIcon
 * @apiFuncType: get
 * @apiFuncUrl: /media/getIcon
 * @swagger
 * /media/getIcon:
 *   get:
 *     description: 获取单条缩略图
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "FE1748B4-69F9-4CAB-8CC0-5EB8A35CB717"
 *         collectionFormat: csv
 *       - in: query
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *     responses:
 *       200:
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
router.get('/getIcon', (req, res) => service.getIcon(req.query, res));

/**
 * @apiName: getObject
 * @apiFuncType: get
 * @apiFuncUrl: /media/getObject
 * @swagger
 * /media/getObject:
 *   get:
 *     description: 获取单条详情
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "FE1748B4-69F9-4CAB-8CC0-5EB8A35CB717"
 *         collectionFormat: csv
 *       - in: query
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *     responses:
 *       200:
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
router.get('/getObject', (req, res) => {
  service.getObject(req.query, (err, rs) => res.json(result.json(err, rs)));
});

/**
 * @apiName: getStream
 * @apiFuncType: get
 * @apiFuncUrl: /media/getStream
 * @swagger
 * /media/getStream:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "FE1748B4-69F9-4CAB-8CC0-5EB8A35CB717"
 *         collectionFormat: csv
 *       - in: query
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *     responses:
 *       200:
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
router.get('/getStream', (req, res) => {
  service.getStream(req.query.objectid, req.query.fromWhere, (err, doc) => {
    if (doc) {
      doc.status += '';

      if (doc.status === '0' && req.ex.userId) {
        service.saveWatching(req.ex.userId, req.query.objectid, req.query.fromWhere, (err) => {
          if (err) {
            logger.error(err);
          }
        });
      }
      return res.json(doc);
    }

    return res.json(err);
  });
});

/**
 * @apiName: getSearchHistory
 * @apiFuncType: get
 * @apiFuncUrl: /media/getSearchHistory
 * @swagger
 * /media/getSearchHistory:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: SearchHistoryInfo
 */
router.get('/getSearchHistory', (req, res) => {
  service.getSearchHistoryForMediaPage(req.ex.userId, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: getWatchHistory
 * @apiFuncType: get
 * @apiFuncUrl: /media/getWatchHistory
 * @swagger
 * /media/getWatchHistory:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: WatchHistoryInfo
 */
router.get('/getWatchHistory', (req, res) => {
  service.getWatchHistoryForMediaPage(req.ex.userId, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: xml2srt
 * @apiFuncType: get
 * @apiFuncUrl: /media/xml2srt
 * @swagger
 * /media/xml2srt:
 *   get:
 *     description: 获得视频播放地址
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectid
 *         required: true
 *         type: string
 *         default: "30EAF8CB-A40A-4BD8-9F8E-20111E9AEC8A"
 *         collectionFormat: csv
 *       - in: query
 *         name: fromWhere
 *         required: false
 *         type: string
 *         default: 'MAM'
 *         description: 'MAM,DAYANG,HK_RUKU'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: xml2srt
 */
router.get('/xml2srt', (req, res) => {
  service.xml2srt(req.query, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
