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
  const pageSize = req.query.pageSize || 999;

  service.listGroup(parentId, type, page, pageSize, (err, docs) =>
    res.json(result.json(err, docs)));
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
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 必须的字段name,type,parentId
 *         schema:
 *           type: object
 *           required:
 *            - name
 *            - type
 *            - parentId
 *           properties:
 *             name:
 *               type: string
 *               example: "中国凤凰卫视"
 *             type:
 *               type: string
 *               example: "0"
 *               description: "'0'表示公司,'1'表示部门,'2'表示小组"
 *             parentId:
 *               type: string
 *               example: ""
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

  service.addGroup(info, (err, docs) => res.json(result.json(err, docs)));
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
 *             _id:
 *               type: string
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

  service.deleteGroup(_id, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: 组成员列表
 * @permissionPath: /group/listUser
 * @apiName: getGroupUserList
 * @apiFuncType: get
 * @apiFuncUrl: /group/listUser
 * @swagger
 * /group/listUser:
 *   get:
 *     description: get group user list
 *     tags:
 *       - v1
 *       - GroupInfo
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
 * @permissionName: 查看成员详情
 * @permissionPath: /group/userDetail
 * @apiName: getGroupUserDetail
 * @apiFuncType: get
 * @apiFuncUrl: /group/userDetail
 * @swagger
 * /group/userDetail:
 *   get:
 *     description: get group user detail
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
 *         default: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/userDetail', (req, res) => {
  const _id = req.query._id || '';

  service.getGroupUserDetail(_id, (err, docs) => res.json(result.json(err, docs)));
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
 * @permissionName: 删除组成员
 * @permissionPath: /group/deleteGroupUser
 * @apiName: postDeleteGroupUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/deleteGroupUser
 * @swagger
 * /group/deleteGroupUser:
 *   post:
 *     description: 删除组成员
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete group user
 *         schema:
 *           type: object
 *           required:
 *            - _ids
 *            - departmentId
 *            - teamId
 *           properties:
 *             _ids:
 *               type: string
 *               example: "asdasd,asdasd,asdasa"
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
router.post('/deleteGroupUser', (req, res) => {
  service.deleteGroupUser(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 组成员调整部门
 * @permissionPath: /group/justifyUserGroup
 * @apiName: postJustifyUserGroup
 * @apiFuncType: post
 * @apiFuncUrl: /group/justifyUserGroup
 * @swagger
 * /group/justifyUserGroup:
 *   post:
 *     description: 组成员调整部门
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: justify user group
 *         schema:
 *           type: object
 *           required:
 *            - _ids
 *            - departmentId
 *            - teamId
 *           properties:
 *             _ids:
 *               type: string
 *               example: "60fdcb70-6b84-11e7-932b-57195ad9cf1d,fcf105d0-6b96-11e7-81f0-83705c4b5ed7"
 *             departmentId:
 *               type: string
 *               example: "2c189400-6083-11e7-80d5-61ac588ddf98"
 *             teamId:
 *               type: string
 *               example: ""
 *               description: "小组可以为空"
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
router.post('/justifyUserGroup', (req, res) => {
  service.justifyUserGroup(req.body, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionName: 禁用或启用组用户
 * @permissionPath: /group/enableUser
 * @apiName: postEnableGroupUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/enableUser
 * @swagger
 * /group/enableUser:
 *   post:
 *     description: 禁用或启用组用户
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: _ids
 *         schema:
 *           type: object
 *           required:
 *            - _ids
 *            - status
 *           properties:
 *             _ids:
 *               type: string
 *               example: "60fdcb70-6b84-11e7-932b-57195ad9cf1d,fcf105d0-6b96-11e7-81f0-83705c4b5ed7"
 *             status:
 *               type: string
 *               example: "1"
 *               description: "'1'表示启用,'0'表示禁用"
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
router.post('/enableUser', (req, res) => {
  service.enableGroupUser(req.body, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 修改组成员信息
 * @permissionPath: /group/updateUser
 * @apiName: postGroupUpdateUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/updateUser
 * @swagger
 * /group/updateUser:
 *   post:
 *     description: 修改组成员信息
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

/**
 * @permissionName: 获取公司或部门或小组或成员权限
 * @permissionPath: /group/getOwnerPermission
 * @apiName: getOwnerPermission
 * @apiFuncType: get
 * @apiFuncUrl: /group/getOwnerPermission
 * @swagger
 * /group/getOwnerPermission:
 *   get:
 *     description: 获取公司或部门或小组或成员权限
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
 *         default: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/getOwnerPermission', (req, res) => {
  service.getOwnerPermission(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 获取公司或部门或小组或成员生效权限
 * @permissionPath: /group/getOwnerEffectivePermission
 * @apiName: getOwnerEffectivePermission
 * @apiFuncType: get
 * @apiFuncUrl: /group/getOwnerEffectivePermission
 * @swagger
 * /group/getOwnerEffectivePermission:
 *   get:
 *     description: 获取公司或部门或小组或成员生效权限
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
 *         default: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *         collectionFormat: csv
 *       - in: query
 *         name: type
 *         description: "'0'表示公司,'1'表示部门,'2'表示小组,'3'表示用户"
 *         required: true
 *         type: string
 *         default: "3"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/getOwnerEffectivePermission', (req, res) => {
  service.getOwnerEffectivePermission(req.query, (err, docs) => res.json(result.json(err, docs)));
});


/**
 * @permissionName: 更新公司或部门或小组或成员的权限
 * @permissionPath: /group/updateOwnerPermission
 * @apiName: postUpdateOwnerPermission
 * @apiFuncType: post
 * @apiFuncUrl: /group/updateOwnerPermission
 * @swagger
 * /group/updateOwnerPermission:
 *   post:
 *     description: 更新公司或部门或小组或成员的权限
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
 *            - type
 *            - roles
 *            - permissions
 *           properties:
 *             _id:
 *               type: string
 *               description: userId or teamId or departmentId or companyId
 *               example: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *             type:
 *               type: string
 *               description: "'0'表示公司,'1'表示部门,'2'表示小组,'3'表示用户"
 *               example: "3"
 *             roles:
 *               type: array
 *               items:
 *                 type: object
 *               example: [{"_id": "asfsa"}, {"_id": "asfsaas"}]
 *             permissions:
 *               type: array
 *               items:
 *                 type: object
 *               example: [{"path": "/role/list", "action": "允许"}, {"path": "/role/update", "action": "拒绝"}]
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
router.post('/updateOwnerPermission', (req, res) => {
  service.updateOwnerPermission(req.body, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: 修改公司或部门或组的属性
 * @permissionPath: /group/updateGroupInfo
 * @apiName: postUpdateGroupInfo
 * @apiFuncType: post
 * @apiFuncUrl: /group/updateGroupInfo
 * @swagger
 * /group/updateGroupInfo:
 *   post:
 *     description: update group info
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update group info
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *            - name
 *            - deleteDeny
 *           properties:
 *             _id:
 *               type: string
 *               description: teamId or departmentId or companyId
 *               example: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *             name:
 *               type: string
 *               example: "xiaoming"
 *             memberCount:
 *               type: integer
 *               example: 50
 *             contact:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *               example: {"_id": "asfasf", "name": "xuyawen", phone: "18719058667", "email": "asfasf@qq.com"}
 *             deleteDeny:
 *               type: string
 *               description: "删除保护,'1'表示开启,'0'表示关闭"
 *               example: "1"
 *
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
router.post('/updateGroupInfo', (req, res) => {
  service.updateGroupInfo(req.body, (err, r) => res.json(result.json(err, r)));
});


/**
 * @permissionName: 搜索公司成员
 * @permissionPath: /group/searchUser
 * @apiName: getGroupSearchUser
 * @apiFuncType: get
 * @apiFuncUrl: /group/searchUser
 * @swagger
 * /group/searchUser:
 *   get:
 *     description: get group search user
 *     tags:
 *       - v1
 *       - GroupInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: companyId
 *         description:
 *         required: true
 *         type: string
 *         default: "28767af0-606b-11e7-9066-d9d30fbb84c0"
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: GroupInfo
 */
router.get('/searchUser', (req, res) => {
  service.searchUser(req.query, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 绑定快传账户
 * @permissionPath: /group/bindMediaExpressUser
 * @apiName: postBindMediaExpressUser
 * @apiFuncType: post
 * @apiFuncUrl: /group/bindMediaExpressUser
 * @swagger
 * /group/bindMediaExpressUser:
 *   post:
 *     description: bind MediaExpress User
 *     tags:
 *       - v1
 *       - GroupInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: bind MediaExpress User
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *            - username
 *            - password
 *           properties:
 *             _id:
 *               type: string
 *               description: userId
 *               example: "bea711c0-67ae-11e7-8b13-c506d97b38b0"
 *             userName
 *               type: string
 *               example: "xiaoming"
 *             password:
 *               type: string
 *               example: '123456'
 *
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
router.post('/bindMediaExpressUser', (req, res) => {
  service.updateGroupInfo(req.body, (err, r) => res.json(result.json(err, r)));
});


module.exports = router;
