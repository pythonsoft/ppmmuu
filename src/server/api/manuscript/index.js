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
 * @permissionGroup: copy
 * @permissionName: 获取稿件标签配置
 * @permissionPath: /manuscript/getTagsConfig
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
 * @permissionGroup: copy
 * @permissionName: 提交稿件时用到的相关配置项
 * @permissionPath: /manuscript/getManuscriptConfig
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
 * @permissionGroup: copy
 * @permissionName: 获取稿件
 * @permissionPath: /manuscript/getManuscript
 * @apiName: getManuscript
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getManuscript
 * @swagger
 * /manuscript/getManuscript:
 *   get:
 *     description: getManuscript
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
 * @permissionGroup: copy
 * @permissionName: 保存稿件
 * @permissionPath: /manuscript/addOrUpdate
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
 * @permissionGroup: copy
 * @permissionName: 稿件统计
 * @permissionPath: /manuscript/getSummary
 * @apiName: getSummary
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getSummary
 * @swagger
 * /manuscript/getSummary:
 *   get:
 *     description: getSummary
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.get('/getSummary', (req, res) => {
  const info = req.query;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;
  service.getSummary(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: copy
 * @permissionName: 稿件列表
 * @permissionPath: /manuscript/list
 * @apiName: listManuscript
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/list
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
 *         name: fieldsNeed
 *         description: '需要的字段'
 *         required: false
 *         type: string
 *         default: '_id,title,viceTitle,createdTime,modifyTime,attachments,status,creator'
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description: '排序的字段'
 *         required: false
 *         type: string
 *         default: '-modifyTime'
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
 *                      toWhere:
 *                        type: string
 *                        description: '提交到什么系统'
 *                        example: 'DAYANG'
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
 * @permissionGroup: copy
 * @permissionName: 稿件搜索历史
 * @permissionPath: /manuscript/getSearchHistory
 * @apiName: getSearchHistory
 * @apiFuncType: get
 * @apiFuncUrl: /manuscript/getSearchHistory
 * @swagger
 * /manuscript/getSearchHistory:
 *   get:
 *     description: getSearchHistory
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         description: '条数'
 *         required: false
 *         type: number
 *         default: 10
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.get('/getSearchHistory', (req, res) => {
  const info = req.query;
  const userInfo = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = userInfo;
  service.getSearchHistoryForManuscript(info, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionGroup: copy
 * @permissionName: 清除稿件搜索历史
 * @permissionPath: /manuscript/clearSearchHistory
 * @apiName: clearSearchHistory
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/clearSearchHistory
 * @swagger
 * /manuscript/clearSearchHistory:
 *   post:
 *     description: clearSearchHistory
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ManuscriptInfo
 */
router.post('/clearSearchHistory', (req, res) => {
  const info = req.query;
  const userInfo = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = userInfo;
  service.clearSearchHistory(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: copy
 * @permissionName: 改变稿件状态
 * @permissionPath: /manuscript/changeManuscriptStatus
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
 *             toWhere:
 *               type: string
 *               description: "提交到什么系统"
 *               example: 'DAYANG'
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
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name, webosTicket: req.ex.userInfo.webosTicket || '', email: req.ex.userInfo.email };
  info.creator = creator;
  info.platform = req.ex.platform;
  service.changeManuscriptStatus(info, (err, r) => res.json(result.json(err, r)));
});


/**
 * @permissionGroup: copy
 * @permissionName: 复制稿件
 * @permissionPath: /manuscript/copy
 * @apiName: copy
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/copy
 * @swagger
 * /manuscript/copy:
 *   post:
 *     description: 复制一个稿件
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 复制一个稿件
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - status
 *           properties:
 *             _id:
 *               type: string
 *             status:
 *               type: string
 *               description: "复制成什么状态的 1: 草稿, 2: 已提交, 3: 垃圾箱, 4:删除"
 *               example: '1'
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
router.post('/copy', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;
  service.copy(info, (err, r) => res.json(result.json(err, r)));
});


/**
 * @permissionGroup: copy
 * @permissionName: 删除稿件
 * @permissionPath: /manuscript/clearAll
 * @apiName: clearAll
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/clearAll
 * @swagger
 * /manuscript/clearAll:
 *   post:
 *     description: clear all manuscript
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
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
router.post('/clearAll', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;
  service.clearAll(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: copy
 * @permissionName: 添加稿件
 * @permissionPath: /manuscript/addAttachment
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
 * @permissionGroup: copy
 * @permissionName: 附件绑定稿件
 * @permissionPath: /manuscript/bindAttachment
 * @apiName: bindAttachment
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/bindAttachment
 * @swagger
 * /manuscript/bindAttachment:
 *   post:
 *     description: 附件绑定稿件
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: bind attachment to a manuscript
 *         schema:
 *           type: object
 *           required:
 *             - manuscriptId
 *             - attachmentId
 *           properties:
 *             manuscriptId:
 *               type: string
 *               description: 稿件_id
 *             attachmentId:
 *               type: string
 *               description: 附件_id
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
router.post('/bindAttachment', (req, res) => {
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;

  service.bindAttachment(info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionGroup: copy
 * @permissionName: 附件列表接口
 * @permissionPath: /manuscript/listAttachments
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
 *         name: fieldsNeed
 *         description: '需要的字段'
 *         required: false
 *         type: string
 *         default: '_id,manuscriptId,name,fileInfo,progress,path,creator,status,createdTime,modifyTime'
 *         collectionFormat: csv
 *       - in: query
 *         name: sortFields
 *         description: '排序的字段'
 *         required: false
 *         type: string
 *         default: '-modifyTime'
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
 * @permissionGroup: copy
 * @permissionName: 稿件删除附件
 * @permissionPath: /manuscript/deleteAttachments
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
 * @permissionGroup: copy
 * @permissionName: 稿件简繁转换
 * @permissionPath: /manuscript/hongKongSimplified
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
 * @permissionGroup: copy
 * @permissionName: 稿件获取联系人组列表
 * @permissionPath: /manuscript/listGroup
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
 * @permissionGroup: copy
 * @permissionName: 稿件获取联系人列表
 * @permissionPath: /manuscript/listUser
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

/**
 * @permissionGroup: copy
 * @permissionName: 稿件附件创建websocket任务
 * @permissionPath: /manuscript/createWebSocketTask
 * @apiName: createWebSocketTask
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/createWebSocketTask
 * @swagger
 * /manuscript/createWebSocketTask:
 *   post:
 *     description: createWebSocketTask
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: createWebSocketTask
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
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
router.post('/createWebSocketTask', (req, res) => {
  const info = req.body;
  const userInfo = req.ex.userInfo;
  info.creator = { _id: userInfo._id, name: userInfo.name };

  service.createWebSocketTask(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: copy
 * @permissionName: 稿件附件更新websocket任务
 * @permissionPath: /manuscript/updateWebSocketTask
 * @apiName: updateWebSocketTask
 * @apiFuncType: post
 * @apiFuncUrl: /manuscript/updateWebSocketTask
 * @swagger
 * /manuscript/updateWebSocketTask:
 *   post:
 *     description: updateWebSocketTask
 *     tags:
 *       - v1
 *       - ManuscriptInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: updateWebSocketTask
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *           properties:
 *             _id:
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
router.post('/updateWebSocketTask', (req, res) => {
  const info = req.body;
  service.updateWebSocketTask(info, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
