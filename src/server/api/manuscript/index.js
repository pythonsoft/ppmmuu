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

/**
 * @apiName: getTagsConfig
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getTagsConfig
 * @swagger
 * /manuscript/getTagsConfig:
 *   get:
 *     description: 获取标签配置
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: '0'
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 example: { value: '1', label: '口播' }
 *             statusInfo:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'ok'
 */
router.get('/getTagsConfig', (req, res) => {
  service.getTagsConfig((err, docs) => res.json(result.json(err, docs)));
});

/**
 * @apiName: getManuscriptConfig
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getManuscriptConfig
 * @swagger
 * /manuscript/getManuscriptConfig:
 *   get:
 *     description: 提交稿件时用到的相关配置项
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.get('/getManuscriptConfig', (req, res) => {
  service.getManuscriptConfig((err, docs) => res.json(result.json(err, docs)));
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
 * @apiName: addOrUpdateManuscript
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/addOrUpdate
 * @swagger
 * /manuscript/addOrUpdate:
 *   post:
 *     description: add or update manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 必须的字段title
 *         schema:
 *           type: object
 *           required:
 *            - title
 *           properties:
 *             _id:
 *               type: string
 *               description: "如果有_id就是更新"
 *             title:
 *               type: string
 *               description: "标题"
 *               example: "标题"
 *             viceTitle:
 *               type: string
 *               description: "副标题"
 *               example: "副标题"
 *             editContent:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tag:
 *                     type: string
 *                     description: "标签  1:口播, 2:正文, 3:同声期, 4:现场配音, 5:字幕, 6:备注"
 *                   content:
 *                     type: string
 *                     description: "标签对应的文字内容"
 *                     example: '这是一段内容'
 *             attachments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   attachmentId:
 *                     type: string
 *                     description: "附件的_id"
 *                     example: '1231'
 *                   userId:
 *                     type: string
 *                     description: "上传附件用户的_id"
 *                     example: '1231'
 *                   name:
 *                     type: string
 *                     description: "附件名"
 *                     example: 'test.mp4'
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
router.post('/addOrUpdate', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;

  service.addOrUpdateManuscript(info, (err, docs) => res.json(result.json(err, docs)));
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
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: object
 *              properties:
 *                page:
 *                  type: number
 *                  description: '页码'
 *                  example: 1
 *                pageSize:
 *                  type: number
 *                  description: '每页个数'
 *                  example: 15
 *                pageCount:
 *                  type: number
 *                  description: '页码总数'
 *                  example: 1
 *                total:
 *                  type: number
 *                  description: '总共个数'
 *                  example: 1
 *                docs:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      title:
 *                        type: string
 *                        description: '标题'
 *                        example: '标题'
 *                      viceTitle:
 *                        type: string
 *                        description: '副标题'
 *                        example: '副标题'
 *                      collaborators:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                              description: ''
 *                            name:
 *                              type: string
 *                              description: ''
 *                          example: {_id: '', name: ''}
 *                        description: '协作者'
 *                      editContent:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            tag:
 *                              type: string
 *                              description: '当前默认为2'
 *                              example: '2'
 *                            content:
 *                              type: string
 *                              description: '内容'
 *                              example: '内容'
 *                            modifyTime:
 *                              type: string
 *                              description: '修改时间'
 *                              example: "2017-12-15T07:56:32.174Z"
 *                      type:
 *                        type: string
 *                        description: '稿件类别'
 *                        example: '1'
 *                      contentType:
 *                        type: string
 *                        description: '类别'
 *                        example: '1'
 *                      source:
 *                        type: string
 *                        description: '来源'
 *                        example: '1'
 *                      important:
 *                        type: string
 *                        description: '重要性'
 *                        example: '1'
 *                      creator:
 *                        type: object
 *                        description: '创建者'
 *                        example: { _id: '', name: ''}
 *                      status:
 *                        type: string
 *                        description: '稿件状态'
 *                        example: '1'
 *                      createType:
 *                        type: string
 *                        description: '创建类型, 1:自己创建的,2:协作者'
 *                        example: '1'
 *                      attachments:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            userId:
 *                              type: string
 *                              description: '创建附件的人的_id'
 *                              example: ''
 *                            attachmentId:
 *                              type: string
 *                              description: '附件_id'
 *                              example: ''
 *                            name:
 *                              type: string
 *                              description: '附件名'
 *                              example: 'test.mp4'
 *                      createdTime:
 *                        type: string
 *                        description: '创建时间'
 *                        example: "2017-12-15T07:56:32.174Z"
 *                      modifyTime:
 *                        type: string
 *                        description: '修改时间'
 *                        example: "2017-12-15T07:56:32.174Z"
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
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
 *             type:
 *               type: string
 *               description: "稿件类别  1: SOT, 2: 干稿"
 *             source:
 *               type: string
 *               description: "来源 1: HK香港, 2: BJ北京"
 *             contentType:
 *               type: string
 *               description: "类别 1: 正点, 2: 直通车"
 *             important:
 *               type: string
 *               description: "重要性 1: 高, 2: 普通, 3: 直通车"
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
 * @apiName: listAttachments
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/listAttachments
 * @swagger
 * /manuscript/listAttachments:
 *   get:
 *     description: 附件列表接口
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: manuscriptId
 *         description: "稿件_id"
 *         required: false
 *         type: string
 *         default: "12131"
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
router.get('/listAttachments', (req, res) => {
  const info = req.query;
  const userInfo = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.userInfo = userInfo;

  service.listAttachments(info, (err, docs) =>
      res.json(result.json(err, docs)));
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


/**
 * @apiName: getGroupList
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/listGroup
 * @swagger
 * /manuscript/listGroup:
 *   get:
 *     description: get list manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: parentId
 *         description:
 *         required: false
 *         type: string
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: group type
 *         required: false
 *         type: string
 *         default: "0"
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
 *         description: RoleInfo
 */
router.get('/listGroup', (req, res) => {
  const info = req.query;
  const userInfo = req.ex.userInfo;
  info.userInfo = userInfo;

  service.listGroup(info, (err, docs) =>
      res.json(result.json(err, docs)));
});

/**
 * @apiName: getGroupUserList
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/listUser
 * @swagger
 * /manuscript/listUser:
 *   get:
 *     description: get manuscript user list
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: "组织_id"
 *         required: true
 *         type: string
 *         example: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: "'0'表示公司,'1'表示部门,'2'表示小组"
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         description: "'1'表示启用,'0'表示禁用,'all'表示全部"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
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
 *         default: 30
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/listUser', (req, res) => {
  service.getGroupUserList(req.query, (err, docs) => res.json(result.json(err, docs)));
});
module.exports = router;
