/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');
const upload = require('../../common/multer').upload;

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);


/**
 * @apiName: addManuscript
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/add
 * @swagger
 * /manuscript/add:
 *   post:
 *     description: add manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 必须的字段title,content
 *         schema:
 *           type: object
 *           required:
 *            - title
 *            - content
 *           properties:
 *             title:
 *               type: string
 *               description: "标题"
 *               example: "标题"
 *             content:
 *               type: string
 *               example: "正文"
 *               description: "正文"
 *             viceTitle:
 *               type: string
 *               description: "副标题"
 *               example: "副标题"
 *             attachments:
 *               type: array
 *               items:
 *                 type: object
 *                 example: {'attachmentId': '123', 'userId': '456', 'name': 'test.mp4' }
 *               description: '附件'
 *             collaborators:
 *               type: array
 *               items:
 *                 type: object
 *                 example: {'_id': '123', name: 'xuyawen'}
 *               description: '协作人'
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
router.post('/add', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;

  service.addManuscript(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: listManuscript
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/listManuscript
 * @swagger
 * /manuscript/list:
 *   get:
 *     description: get list manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: "1: 草稿, 2: 已提交, 3: 垃圾箱"
 *         required: false
 *         type: string
 *         default: "1"
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description: 关键字模糊搜素
 *         required: false
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         description: ''
 *         required: false
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         description: ''
 *         required: false
 *         type: integer
 *         default: 15
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.get('/list', (req, res) => {
  const info = req.query;
  const userInfo = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.userInfo = userInfo;

  service.listManuscript(info, (err, docs) =>
    res.json(result.json(err, docs)));
});

/**
 * @apiName: getManuscript
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getManuscript
 * @swagger
 * /manuscript/getManuscript:
 *   get:
 *     description: get list allChildGroups
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: ''
 *         required: false
 *         type: string
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.get('/getManuscript', (req, res) => {
  service.getManuscript(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: updateManuscript
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/updateManuscript
 * @swagger
 * /manuscript/updateManuscript:
 *   post:
 *     description: add manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: '必须的字段_id'
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               description: ''
 *               example: '123'
 *             title:
 *               type: string
 *               description: "标题"
 *               example: "标题"
 *             content:
 *               type: string
 *               example: "正文"
 *               description: "正文"
 *             viceTitle:
 *               type: string
 *               description: "副标题"
 *               example: "副标题"
 *             attachments:
 *               type: array
 *               items:
 *                 type: object
 *                 example: {'attachmentId': '123', 'userId': '456', 'name': 'test.mp4' }
 *               description: '附件'
 *             collaborators:
 *               type: array
 *               items:
 *                 type: object
 *                 example: {'_id': '123', name: 'xuyawen'}
 *               description: '协作人'
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
router.post('/updateManuscript', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;

  service.updateManuscript(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: changeManuscriptStatus
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/changeManuscriptStatus
 * @swagger
 * /manuscript/changeManuscriptStatus:
 *   post:
 *     description: change manuscript status
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete manuscript
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *             - status
 *           properties:
 *             _ids:
 *               type: string
 *             status:
 *               type: string
 *               description: "1: 草稿, 2: 已提交, 3: 垃圾箱, 4:删除"
 *     responses:
 *       200:
 *         description: ManuscriptInfo
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
router.post('/changeManuscriptStatus', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;
  service.changeManuscriptStatus(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: addAttachment
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/addAttachment
 * @swagger
 * /manuscript/addAttachment:
 *   post:
 *     description: add attachment
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: UploadResult
 */
router.post('/addAttachment', upload.single('file'), (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;
  info.fileInfo = req.file;

  service.createAttachment(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: deleteAttachments
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/deleteAttachments
 * @swagger
 * /manuscript/deleteAttachments:
 *   post:
 *     description: deleteAttachments
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: deleteAttachments
 *         schema:
 *           type: object
 *           required:
 *             - _ids
 *           properties:
 *             _ids:
 *               type: string
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             data:
 *               type: object
 *             statusInfo:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/deleteAttachments', (req, res) => {
  const info = req.body;
  service.deleteAttachmentInfos(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: hongKongSimplified
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/hongKongSimplified
 * @swagger
 * /manuscript/hongKongSimplified:
 *   post:
 *     description: 简繁转换
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 简繁转换
 *         schema:
 *           type: object
 *           properties:
 *             conversionType:
 *               type: string
 *               description: "0: 繁体转简体, 1:简体转繁体"
 *               default: "1"
 *             title:
 *               type: string
 *               description: '标题'
 *             viceTitle:
 *               type: string
 *               description: '副标题'
 *             content:
 *               type: string
 *               description: '内容'
 *     responses:
 *       200:
 *         description: ManuscriptInfo
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
router.post('/hongKongSimplified', (req, res) => {
  const info = req.body;
  service.hongKongSimplified(info, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
