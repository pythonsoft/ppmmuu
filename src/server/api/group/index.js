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
 * @permissionName: 组列表
 * @permissionPath: /group/list
 * @apiName: getGroupList
 * @apiFuncType: get
 * @apiFuncUrl: /group/list
 * @swagger
 * /group/list:
 *   get:
 *     description: get list groups
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
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
router.get('/list', (req, res) => {
  const parentId = req.query.parentId || '';
  const type = req.query.type || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;

  service.listGroup(parentId, type, page, pageSize, (err, docs) =>
    res.json(result.json(err, docs)));
});

/**
 * @permissionName: 组的所有子组列表
 * @permissionPath: /group/listAllChildGroup
 * @apiName: getAllChildGroupList
 * @apiFuncType: get
 * @apiFuncUrl: /group/listAllChildGroup
 * @swagger
 * /group/listAllChildGroup:
 *   get:
 *     description: get list allChildGroups
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: false
 *         type: string
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
 *         collectionFormat: csv
 *       - in: query
 *         name: fields
 *         description:
 *         required: false
 *         type: string
 *         default: "name,creator,type"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/listAllChildGroup', (req, res) => {
  const _id = req.query._id || '';
  const fields = req.query.fields || '';

  service.listAllChildGroup(_id, fields, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 组的详情
 * @permissionPath: /group/getDetail
 * @apiName: getGroupDetail
 * @apiFuncType: get
 * @apiFuncUrl: /group/getDetail
 * @swagger
 * /group/getDetail:
 *   get:
 *     description: get list allChildGroups
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: false
 *         type: string
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/getDetail', (req, res) => {
  const _id = req.query._id || '';

  service.getGroup(_id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 添加组
 * @permissionPath: /group/add
 * @apiName: postAddGroup
 * @apiFuncType: post
 * @apiFuncUrl: /group/add
 * @swagger
 * /group/add:
 *   post:
 *     description: add group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add group
 *         schema:
 *           type: object
 *           required:
 *            - name
 *            - type
 *           properties:
 *             name:
 *               type: string
 *               example: "中国凤凰卫视"
 *             type:
 *               type: string
 *               example: "1"
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
  const parentId = req.body.parentId || '';
  const info = req.body;
  const creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  info.creator = creator;

  service.addGroup(parentId, info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 更新组
 * @permissionPath: /group/update
 * @apiName: postUpdateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /group/update
 * @swagger
 * /group/update:
 *   post:
 *     description: update group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update group
 *         schema:
 *           type: object
 *           required:
 *            - name
 *            - type
 *           properties:
 *             name:
 *               type: string
 *               example: "中国凤凰卫视"
 *             type:
 *               type: string
 *               example: "1"
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
router.post('/update', (req, res) => {
  const _id = req.body._id || '';
  const info = req.body;

  service.updateGroup(_id, info, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 删除组
 * @permissionPath: /group/delete
 * @apiName: postDeleteGroup
 * @apiFuncType: post
 * @apiFuncUrl: /group/delete
 * @swagger
 * /group/delete:
 *   post:
 *     description: delete group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete group
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             name:
 *               type: string
 *               example: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
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
router.post('/delete', (req, res) => {
  const _id = req.body._id || '';

  service.deleteGroup(_id, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 查看成员详情
 * @permissionPath: /group/userDetail
 * @apiName: getGroupUserDetail
 * @apiFuncType: post
 * @apiFuncUrl: /group/userDetail
 * @swagger
 * /group/userDetail:
 *   get:
 *     description: get group user detail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: "xuyawen@phoenixtv.com"
 *         collectionFormat: csv
 *       - in: query
 *         name: fields
 *         description:
 *         required: false
 *         type: string
 *         default: "name,_id,createdTime"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/userDetail', (req, res) => {
  const _id = req.query._id || '';
  const fields = req.query.fields || '';

  service.getGroupUserDetail(_id, fields, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 添加组成员
 * @permissionPath: /group/addUser
 * @apiName: postGroupAddUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/addUser
 * @swagger
 * /group/addUser:
 *   post:
 *     description: add group user
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add group user
 *         schema:
 *           type: object
 *           required:
 *            - email
 *            - name
 *            - displayName
 *            - companyId
 *            - password
 *            - phone
 *           properties:
 *             email:
 *               type: string
 *               example: "xuyawen@phoenixtv.com"
 *             name:
 *               type: string
 *               example: "小明"
 *             displayName:
 *               type: string
 *               example: "xiaoming"
 *             departmentId:
 *               type: string
 *               example: "2c189400-6083-11e7-80d5-61ac588ddf98"
 *             teamId:
 *               type: string
 *               example: "2c189400-6083-11e7-80d5-61ac588ddf98"
 *             companyId:
 *               type: string
 *               example: "28767af0-606b-11e7-9066-d9d30fbb84c0"
 *             phone:
 *               type: string
 *               example: "13876556785"
 *             password:
 *               type: string
 *               example: "123456"
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
router.post('/addUser', (req, res) => {
  service.addGroupUser(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 修改组成员
 * @permissionPath: /group/updateUser
 * @apiName: postGroupUpdateUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/updateUser
 * @swagger
 * /group/updateUser:
 *   post:
 *     description: update group user
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update group user
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: "xiaoming@phoenixtv.com"
 *             name:
 *               type: string
 *               example: "小明"
 *             displayName:
 *               type: string
 *               example: "xiaoming"
 *             departmentId:
 *               type: string
 *               example: "2c189400-6083-11e7-80d5-61ac588ddf98"
 *             teamId:
 *               type: string
 *               example: "2c189400-6083-11e7-80d5-61ac588ddf98"
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
router.post('/updateUser', (req, res) => {
  service.updateGroupUser(req.body, (err, docs) => res.json(result.json(err, docs)));
});
module.exports = router;
