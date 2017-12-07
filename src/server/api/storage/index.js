/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');

const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

const service = require('./service');

/**
 * @permissionGroup: bucket
 * @permissionName: 存储区列表
 * @permissionPath: /storage/listBucket
 * @apiName: listBucket
 * @apiFuncType: get
 * @apiFuncUrl: /storage/listBucket
 * @swagger
 * /storage/listBucket:
 *   get:
 *     description: get storage listBucket
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description:
 *         required: false
 *         type: string
 *         default: '1'
 *         collectionFormat: csv
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
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         example: "添加"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BucketInfo
 */
router.get('/listBucket', (req, res) => {
  const keyword = req.query.keyword || '';
  const status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize;
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listBucket(keyword, status, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});


/**
 * @permissionGroup: bucket
 * @permissionName: 存储区详情
 * @permissionPath: /storage/getBucketDetail
 * @apiName: getBucketDetail
 * @apiFuncType: get
 * @apiFuncUrl: /storage/getBucketDetail
 * @swagger
 * /storage/getBucketDetail:
 *   get:
 *     description: getBucketDetail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BucketInfo
 */
router.get('/getBucketDetail', (req, res) => {
  const id = req.query._id || '';

  service.getBucketDetail(id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: bucket
 * @permissionName: 增加存储区
 * @permissionPath: /storage/addBucket
 * @apiName: addBucket
 * @apiFuncType: post
 * @apiFuncUrl: /storage/addBucket
 * @swagger
 * /storage/addBucket:
 *   post:
 *     description: addBucket
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: addBucket
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *               example: admin
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/addBucket', (req, res) => {
  req.body.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addBucket(req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionGroup: bucket
 * @permissionName: 编辑存储区
 * @permissionPath: /storage/updateBucket
 * @apiName: updateBucket
 * @apiFuncType: post
 * @apiFuncUrl: /storage/updateBucket
 * @swagger
 * /storage/updateBucket:
 *   post:
 *     description: update bucket
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update bucket
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - name
 *           properties:
 *             _id:
 *               type: string
 *               example: '12321412'
 *             name:
 *               type: string
 *               example: '低码流存储区'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/updateBucket', (req, res) => {
  service.updateBucket(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: bucket
 * @permissionName: 启动或挂起存储区
 * @permissionPath: /storage/enableBucket
 * @apiName: enableBucket
 * @apiFuncType: post
 * @apiFuncUrl: /storage/enableBucket
 * @swagger
 * /storage/enableBucket:
 *   post:
 *     description: enableBucket
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: enableBucket
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - status
 *           properties:
 *             _id:
 *               type: string
 *               example: '123123'
 *             status:
 *               type: string
 *               example: "0: NORMAL, 1: HAND_UP"
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/enableBucket', (req, res) => {
  service.updateBucket(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: bucket
 * @permissionName: 删除存储区
 * @permissionPath: /storage/deleteBucket
 * @apiName: deleteBucket
 * @apiFuncType: post
 * @apiFuncUrl: /storage/deleteBucket
 * @swagger
 * /storage/deleteBucket:
 *   post:
 *     description: deleteBucket
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete bucket
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: '12313'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/deleteBucket', (req, res) => {
  service.deleteBucket(req.body._id, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storagePath
 * @permissionName: 存储路径列表
 * @permissionPath: /storage/listPath
 * @apiName: listPath
 * @apiFuncType: get
 * @apiFuncUrl: /storage/listPath
 * @swagger
 * /storage/listPath:
 *   get:
 *     description: get storage listPath
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: bucketId
 *         description: bucketInfo _id
 *         required: false
 *         type: string
 *         default: '1123'
 *         collectionFormat: csv
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
 *         description: BucketInfo
 */
router.get('/listPath', (req, res) => {
  const bucketId = req.query.bucketId || '';
  const status = req.query.status || '';
  const keyword = req.query.keyword || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize;
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed;

  service.listPath(bucketId, status, keyword, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});


/**
 * @permissionGroup: storagePath
 * @permissionName: 存储路径详情
 * @permissionPath: /storage/getPathDetail
 * @apiName: getPathDetail
 * @apiFuncType: get
 * @apiFuncUrl: /storage/getPathDetail
 * @swagger
 * /storage/getPathDetail:
 *   get:
 *     description: getPathDetail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: 路径_id
 *         type: string
 *         default: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *       - in: query
 *         name: viceId
 *         description: 路径副标识
 *         type: string
 *         default: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *       - in: query
 *         name: bucketId
 *         description: 路径所属存储区_id
 *         type: string
 *         default: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BucketInfo
 */
router.get('/getPathDetail', (req, res) => {
  service.getPathDetail(req.query, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: storagePath
 * @permissionName: 增加存储路径
 * @permissionPath: /storage/addPath
 * @apiName: addPath
 * @apiFuncType: post
 * @apiFuncUrl: /storage/addPath
 * @swagger
 * /storage/addPath:
 *   post:
 *     description: addPath
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: addPath
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - viceId
 *             - name
 *             - path
 *             - type
 *             - maxSize
 *           properties:
 *             id:
 *               type: string
 *               example: ''
 *             viceId:
 *               type: string
 *               example: ''
 *             name:
 *               type: string
 *               example: admin
 *             path:
 *               type: string
 *               example: admin
 *             maxSize:
 *               type: integer
 *               example: 10
 *             type:
 *               type: string
 *               description: "0:S3,1:BAIDU_CLOUD,2:ALIYUN,3:LOCAL,4:CIFS,5:NETWORK"
 *               example: '0'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/addPath', (req, res) => {
  const bucketId = req.body.bucket._id || '';
  req.body.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addPath(bucketId, req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionGroup: storagePath
 * @permissionName: 编辑存储路径
 * @permissionPath: /storage/updatePath
 * @apiName: updatePath
 * @apiFuncType: post
 * @apiFuncUrl: /storage/updatePath
 * @swagger
 * /storage/updatePath:
 *   post:
 *     description: updatePath
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update path
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - name
 *             - path
 *             - type
 *             - maxSize
 *           properties:
 *             _id:
 *               type: string
 *               example: "1233"
 *             name:
 *               type: string
 *               example: admin
 *             path:
 *               type: string
 *               example: admin
 *             maxSize:
 *               type: integer
 *               example: 10
 *             type:
 *               type: string
 *               description: "0:S3,1:BAIDU_CLOUD,2:ALIYUN,3:LOCAL,4:CIFS,5:NETWORK"
 *               example: '0'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/updatePath', (req, res) => {
  service.updatePath(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storagePath
 * @permissionName: 启动或挂起存储路径
 * @permissionPath: /storage/enablePath
 * @apiName: enablePath
 * @apiFuncType: post
 * @apiFuncUrl: /storage/enablePath
 * @swagger
 * /storage/enablePath:
 *   post:
 *     description: enablePath
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: enablePath
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - status
 *           properties:
 *             _id:
 *               type: string
 *               example: '123123'
 *             status:
 *               type: string
 *               description: "0: NORMAL, 1:HAND_UP"
 *               example: '0'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/enablePath', (req, res) => {
  service.enablePath(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storagePath
 * @permissionName: 删除存储路径
 * @permissionPath: /storage/deletePath
 * @apiName: deletePath
 * @apiFuncType: post
 * @apiFuncUrl: /storage/deletePath
 * @swagger
 * /storage/deletePath:
 *   post:
 *     description: deletePath
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: deletePath
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: '12313'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/deletePath', (req, res) => {
  service.deletePath(req.body._id, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storageTactics
 * @permissionName: 存储策略列表
 * @permissionPath: /storage/listTactics
 * @apiName: listTactics
 * @apiFuncType: get
 * @apiFuncUrl: /storage/listTactics
 * @swagger
 * /storage/listTactics:
 *   get:
 *     description: get storage listTactics
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sourceId
 *         description: bucketInfo _id or pathInfo _id
 *         required: false
 *         type: string
 *         default: '1123'
 *         collectionFormat: csv
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
 *       - in: query
 *         name: sortFields
 *         description:
 *         required: false
 *         type: string
 *         default: '-createdTime'
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BucketInfo
 */
router.get('/listTactics', (req, res) => {
  const sourceId = req.query.sourceId || '';
  const status = req.query.status || '';
  const keyword = req.query.keyword || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize;
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed;

  service.listTactics(sourceId, status, keyword, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});


/**
 * @permissionGroup: storageTactics
 * @permissionName: 存储策略详情
 * @permissionPath: /storage/getTacticsDetail
 * @apiName: getTacticDetail
 * @apiFuncType: get
 * @apiFuncUrl: /storage/getTacticsDetail
 * @swagger
 * /storage/getTacticsDetail:
 *   get:
 *     description: getTacticsDetail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BucketInfo
 */
router.get('/getTacticsDetail', (req, res) => {
  const id = req.query._id || '';

  service.getTacticsDetail(id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: storageTactics
 * @permissionName: 增加策略
 * @permissionPath: /storage/addTactics
 * @apiName: addTactics
 * @apiFuncType: post
 * @apiFuncUrl: /storage/addTactics
 * @swagger
 * /storage/addTactics:
 *   post:
 *     description: addTactics
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: addTactics
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - source
 *           properties:
 *             name:
 *               type: string
 *               example: "单一策略"
 *             source:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                   description: "0: BUCKET, 1: PATH"
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/addTactics', (req, res) => {
  req.body.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addTactics(req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionGroup: storageTactics
 * @permissionName: 编辑存储策略
 * @permissionPath: /storage/updateTactics
 * @apiName: updateTactics
 * @apiFuncType: post
 * @apiFuncUrl: /storage/updateTactics
 * @swagger
 * /storage/updateTactics:
 *   post:
 *     description: updateTactics
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: updateTactics
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - name
 *             - source
 *           properties:
 *             _id:
 *               type: string
 *               exmaple: "12414"
 *             name:
 *               type: string
 *               example: "单一策略"
 *             source:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                   description: "0: BUCKET, 1: PATH"
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/updateTactics', (req, res) => {
  service.updateTactics(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storageTactics
 * @permissionName: 启动或挂起策略
 * @permissionPath: /storage/enableTactics
 * @apiName: enableTactics
 * @apiFuncType: post
 * @apiFuncUrl: /storage/enableTactics
 * @swagger
 * /storage/enableTactics:
 *   post:
 *     description: enableTactics
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: enableTactics
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - status
 *           properties:
 *             _id:
 *               type: string
 *               example: '123123'
 *             status:
 *               type: string
 *               description: "0: NORMAL, 1:HAND_UP"
 *               example: '0'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/enableTactics', (req, res) => {
  service.enableTactics(req.body._id, req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionGroup: storageTactics
 * @permissionName: 删除存储策略
 * @permissionPath: /storage/deleteTactics
 * @apiName: deleteTactics
 * @apiFuncType: post
 * @apiFuncUrl: /storage/deleteTactics
 * @swagger
 * /storage/deleteTactics:
 *   post:
 *     description: deleteTactics
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - BucketInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: deleteTactics
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: '12313'
 *     responses:
 *       200:
 *         description: BucketInfo
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
router.post('/deleteTactics', (req, res) => {
  service.deleteTactics(req.body._id, (err) => {
    res.json(result.json(err, {}));
  });
});
module.exports = router;
