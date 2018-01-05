/**
 * Created by steven on 17/5/5.
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
 * @permissionGroup: connection
 * @permissionName: 通道连线数量统计
 * @permissionPath: /connection/getSummary
 * @apiName: getSummary
 * @apiFuncType: get
 * @apiFuncUrl: /connection/getSummary
 * @swagger
 * /connection/getSummary:
 *   get:
 *     description: 通道连线数量统计
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ''
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: '_id'
 *                    example: '124124'
 *                  photo:
 *                    type: string
 *                    description: ''
 *                    example: '124124'
 *                  name:
 *                    type: string
 *                    description: ''
 *                    example: '124124124'
 *                  count:
 *                    type: number
 *                    description: '这个通道连线数量'
 *                    example: 2
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
 */
router.get('/getSummary', (req, res) => {
  service.getSummary((err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: connection
 * @permissionName: 获取所有通道
 * @permissionPath: /connection/getAllChannel
 * @apiName: getAllChannel
 * @apiFuncType: get
 * @apiFuncUrl: /connection/getAllChannel
 * @swagger
 * /connection/getAllChannel:
 *   get:
 *     description: 获取所有通道
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ''
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: '_id'
 *                    example: '124124'
 *                  photo:
 *                    type: string
 *                    description: ''
 *                    example: '124124'
 *                  name:
 *                    type: string
 *                    description: ''
 *                    example: '124124124'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
 */
router.get('/getAllChannel', (req, res) => {
  service.getAllChannel((err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: connection
 * @permissionName: 请求连线
 * @permissionPath: /connection/askLine
 * @apiName: askLine
 * @apiFuncType: get
 * @apiFuncUrl: /connection/askLine
 * @swagger
 * /connection/askLine:
 *   get:
 *     description: 请求连线
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: "记者_id,如果是PC端连手机端,那么必填,手机端不用填"
 *         type: string
 *         example: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *         collectionFormat: csv
 *       - in: query
 *         name: name
 *         description: "如果是PC端连手机端,那么必填,手机端不用填"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: photo
 *         description: "如果是PC端连手机端,那么必填,手机端不用填"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: "'1'表示手机端连PC端,'2'表示PC端连手机端"
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: channelId
 *         description: "通道_id,如果是PC端连手机端,那么必填,手机端不用填"
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ''
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: '_id'
 *                  example: '124124'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
 */
router.get('/askLine', (req, res) => {
  const info = req.query;
  info.user = {
    _id: req.ex.userInfo._id,
    name: req.ex.userInfo.name,
    photo: req.ex.userInfo.photo,
  };
  service.createAnchorInfo(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: connection
 * @permissionName: 查询连线
 * @permissionPath: /connection/getLine
 * @apiName: getLine
 * @apiFuncType: get
 * @apiFuncUrl: /connection/getLine
 * @swagger
 * /connection/getLine:
 *   get:
 *     description: 查询连线，主要是看连线状态是否是被接受了
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: ''
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: '_id'
 *                  example: '124124'
 *                channelId:
 *                  type: string
 *                  description: '通道Id'
 *                  example: '124124'
 *                targetId:
 *                  type: string
 *                  description: '连线对象sdk生成的uid'
 *                  example: '124124124'
 *                dealUser:
 *                  type: object
 *                  description: '处理连线者(记者或管理员)'
 *                  example: {_id: '', name: ''}
 *                userName:
 *                  type: string
 *                  description: '记者名'
 *                  example: 'xuyawen'
 *                type:
 *                  type: string
 *                  description: "1: 手机端连PC端,2:PC端连手机端"
 *                  example: '1'
 *                status:
 *                  type: string
 *                  description: "1: 等待中,2:已进入,3:拒绝,4:挂断,5:出错"
 *                  example: '1'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
 */
router.get('/getLine', (req, res) => {
  const info = req.query;
  info._id = req.ex.userInfo._id;
  service.getAnchorInfo(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: connection
 * @permissionName: 处理连线，分配通道
 * @permissionPath: /connection/dealLine
 * @apiName: dealLine
 * @apiFuncType: post
 * @apiFuncUrl: /connection/dealLine
 * @swagger
 * /connection/dealLine:
 *   post:
 *     description: 处理连线
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 必须的字段status
 *         schema:
 *           type: object
 *           required:
 *             - status
 *             - type
 *           properties:
 *             status:
 *               type: string
 *               description: "1:等待,2:接受,3:拒绝,4:挂断"
 *               example: '2'
 *             channelId:
 *               type: string
 *               example: "14214"
 *               description: "通道_id,如果是PC端处理连线，则必填"
 *             anchorId:
 *               type: string
 *               example: "14214"
 *               description: "请求连线的user _id, 如果是PC端处理连线，则必填"
 *             targetId:
 *               type: string
 *               description: '客户端语音视频sdk生成的uid, 如果是PC端处理连线，则必填'
 *               example: "123456"
 *     responses:
 *       200:
 *         description: ''
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *              example: '0'
 *            data:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: '_id'
 *                  example: '124124'
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'ok'
 */
router.post('/dealLine', (req, res) => {
  const info = req.body;
  info.dealUser = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.assignChannel(info, (err, r) => res.json(result.json(err, r)));
});

/**
 * @apiName: listAnchor
 * @apiFuncType: get
 * @apiFuncUrl: /connection/listAnchor
 * @swagger
 * /connection/listAnchor:
 *   get:
 *     description: get list anchor
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description: '类型. 1:手机端主动连PC端,2:PC端主动连手机端'
 *         required: false
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         description: "状态.1:等待,2:接受,3:拒绝,4:挂断,多个状态查询用逗号分隔"
 *         required: false
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description: 关键字模糊搜素
 *         required: false
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *       - in: query
 *         name: channelId
 *         description: '通道_id'
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
 *         default: '_id,type,channelId,userName,photo,dealUser,status,modifyTime,createdTime'
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
 *         description: ''
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
 *                      _id:
 *                        type: string
 *                        description: '_id'
 *                        example: '13123'
 *                      type:
 *                        type: string
 *                        description: '类型.1:手机端主动连PC端,2:PC端主动连手机端'
 *                        example: '2'
 *                      channelId:
 *                        type: string
 *                        description: '通道_id'
 *                        example: '131'
 *                      userName:
 *                        type: string
 *                        description: '主播名'
 *                        example: 'xuyawen'
 *                      photo:
 *                        type: string
 *                        description: '主播头像'
 *                        example: 'DAYANG'
 *                      creator:
 *                        type: object
 *                        description: '创建请求者'
 *                        example: { _id: '', name: ''}
 *                      dealUser:
 *                        type: object
 *                        description: '处理请求者'
 *                        example: { _id: '', name: ''}
 *                      status:
 *                        type: string
 *                        description: '状态.1:等待,2:接受,3:拒绝,4:挂断'
 *                        example: '2'
 *                      targetId:
 *                        type: string
 *                        description: '语音视频sdk生成的uid'
 *                        example: '123213'
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
router.get('/listAnchor', (req, res) => {
  const info = req.query;
  const userInfo = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.userInfo = userInfo;

  service.listAnchor(info, (err, docs) =>
      res.json(result.json(err, docs)));
});

module.exports = router;
