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
 * @permissionName: 角色列表
 * @permissionPath: /role/list
 * @apiName: getRoleList
 * @apiFuncType: get
 * @apiFuncUrl: /role/list
 * @swagger
 * /role/list:
 *   get:
 *     description: get list roles
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
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
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         example: "添加"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/list', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const keyword = req.query.keyword || '';
  const fields = req.query.fields || '_id,name,description';

  service.listRole(page, pageSize, keyword, fields, (err, docs) => res.json(result.json(err, docs)));
});

/**
 * @permissionName: 角色详情
 * @permissionPath: /role/getDetail
 * @apiName: getRoleDetail
 * @apiFuncType: get
 * @apiFuncUrl: /role/getDetail
 * @swagger
 * /role/getDetail:
 *   get:
 *     description: get role detail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
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
 *         description: RoleInfo
 */
router.get('/getDetail', (req, res) => {
  const id = req.query._id || '';

  service.getRoleDetail(id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionName: 增加角色
 * @permissionPath: /role/add
 * @apiName: postAddRole
 * @apiFuncType: post
 * @apiFuncUrl: /role/add
 * @swagger
 * /role/add:
 *   post:
 *     description: add role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add role
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *            - name
 *           properties:
 *             _id:
 *               type: string
 *               example: admin
 *             name:
 *               type: string
 *               example: admin
 *             allowedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/list","/role/getDetail"]
 *             deniedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/add","/role/update"]
 *     responses:
 *       200:
 *         description: RoleInfo
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
  req.body.creator = { _id: req.ex.userInfo._id, name: req.ex.userInfo.name };
  service.addRole(req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionName: 编辑角色
 * @permissionPath: /role/update
 * @apiName: postUpdateRole
 * @apiFuncType: post
 * @apiFuncUrl: /role/update
 * @swagger
 * /role/update:
 *   post:
 *     description: update role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update role
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: admin
 *             name:
 *               type: string
 *               example: admin
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/update', (req, res) => {
  service.updateRole(req.body, (err) => {
    res.json(result.json(err, {}));
  });
});


/**
 * @permissionName: 编辑角色中增加权限
 * @permissionPath: /role/updateRoleAddPermission
 * @apiName: postUpdateRoleAddPermission
 * @apiFuncType: post
 * @apiFuncUrl: /role/updateRoleAddPermission
 * @swagger
 * /role/updateRoleAddPermission:
 *   post:
 *     description: update role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update role
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: admin
 *             allowedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/list","/role/getDetail"]
 *             deniedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/ ","/role/update"]
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/updateRoleAddPermission', (req, res) => {
  service.updateRolePermission(req.body, true, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionName: 编辑角色中删除权限
 * @permissionPath: /role/updateRoleDeletePermission
 * @apiName: postUpdateRoleDeletePermission
 * @apiFuncType: post
 * @apiFuncUrl: /role/updateRoleDeletePermission
 * @swagger
 * /role/updateRoleDeletePermission:
 *   post:
 *     description: update role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update role
 *         schema:
 *           type: object
 *           required:
 *            - _id
 *           properties:
 *             _id:
 *               type: string
 *               example: admin
 *             allowedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/list","/role/getDetail"]
 *             deniedPermissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["/role/ ","/role/update"]
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/updateRoleDeletePermission', (req, res) => {
  service.updateRolePermission(req.body, false, (err, r) => {
    res.json(result.json(err, r));
  });
});


/**
 * @permissionName: 删除角色
 * @permissionPath: /role/delete
 * @apiName: postDeleteRole
 * @apiFuncType: post
 * @apiFuncUrl: /role/delete
 * @swagger
 * /role/delete:
 *   post:
 *     description: delete role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete role
 *         schema:
 *           type: object
 *           required:
 *            - _ids
 *           properties:
 *             _ids:
 *               type: string
 *               example: 1c6ad690-5583-11e7-b784-69097aa4b384
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/delete', (req, res) => {
  service.deleteRoles(req.body._ids, err => res.json(result.json(err, {})));
});

/*
 * @permissionName: 权限列表
 * @permissionPath: /role/listPermission
 * @apiName: getPermissionList
 * @apiFuncType: get
 * @apiFuncUrl: /role/listPermission
 * @swagger
 * /role/listPermission:
 *   get:
 *     description: get list permissions
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: roleId
 *         description: wish get role permission, post it.
 *         required: false
 *         type: string
 *         example: roleId
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
 *       - in: query
 *         name: sortFields
 *         description: sort by this params
 *         required: false
 *         type: string
 *         default: -createdTime
 *         collectionFormat: csv
 *       - in: query
 *         name: fieldsNeed
 *         description: request only you need fields
 *         required: false
 *         type: string
 *         default: '-name,createdTime'
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: PermissionInfo
 */
router.get('/listPermission', (req, res) => {
  const roleId = req.query.roleId;
  const status = req.query.status;
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed;
  const name = req.query.keyword || '';

  service.listPermission(roleId, status, name, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 分配角色给用户或组织
 * @permissionPath: /role/assignRole
 * @apiName: postAssignRole
 * @apiFuncType: post
 * @apiFuncUrl: /role/assignRole
 * @swagger
 * /role/assignRole:
 *   post:
 *     description: assign role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: assign role
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - roles
 *             - type
 *           properties:
 *             roles:
 *               type: string
 *               example: "admin,guest,support"
 *             _id:
 *               type: string
 *               example: xuyawen@phoenixtv.com
 *             type:
 *               type: string
 *               example: "3"
 *               description: '"0"表示公司, "1"表示部门, "2"表示小组, "3"表示用户 '
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/assignRole', (req, res) => {
  service.assignRole(req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionName: 删除用户或组织的角色
 * @permissionPath: /role/deleteOwnerRole
 * @apiName: postDeleteOwnerRole
 * @apiFuncType: post
 * @apiFuncUrl: /role/deleteOwnerRole
 * @swagger
 * /role/deleteOwnerRole:
 *   post:
 *     description: delete owner role
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete owner role
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - roles
 *           properties:
 *             roles:
 *               type: string
 *               example: "admin,guest,support"
 *             _id:
 *               type: string
 *               example: xuyawen@phoenixtv.com
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/deleteOwnerRole', (req, res) => {
  service.deleteOwnerRole(req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionName: 启用或禁用权限
 * @permissionPath: /role/enablePermission
 * @apiName: postEnablePermission
 * @apiFuncType: post
 * @apiFuncUrl: /role/enablePermission
 * @swagger
 * /role/enablePermission:
 *   post:
 *     description: enable or disable permission permission
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - PermissionInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: need status value
 *         schema:
 *           type: object
 *           required:
 *            - paths
 *            - status
 *           properties:
 *             paths:
 *               type: string
 *               example: "/role/list,/role/udpate"
 *             status:
 *               type: string
 *               example: "0"
 *               description: "'0' stands for 'enable','1' stands for 'disable'"
 *
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.post('/enablePermission', (req, res) => {
  service.enablePermission(req.body, (err, r) => {
    res.json(result.json(err, r));
  });
});

/**
 * @permissionName: 搜索拥有特定角色的用户,组织,部门,小组
 * @permissionPath: /role/getRoleOwners
 * @apiName: getRoleOwners
 * @apiFuncType: get
 * @apiFuncUrl: /role/getRoleOwners
 * @swagger
 * /role/getRoleOwners:
 *   get:
 *     description: "搜索拥有特定角色的用户,组织,部门,小组"
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: role _id
 *         required: true
 *         type: string
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description: user or group name
 *         required: true
 *         type: string
 *         default: "xuyawen"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.get('/getRoleOwners', (req, res) => {
  service.getRoleOwners(req.query, (err, r) => {
    res.json(result.json(err, r));
  });
});


/**
 * @permissionName: 角色中搜索用户或组织
 * @permissionPath: /role/search/userOrGroup
 * @apiName: getRoleSearchUserOrGroup
 * @apiFuncType: get
 * @apiFuncUrl: /role/search/userOrGroup
 * @swagger
 * /role/search/userOrGroup:
 *   get:
 *     description: search user or group
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: type
 *         description: '"0" stands for user, "1" stands for group'
 *         required: true
 *         type: string
 *       - in: query
 *         name: keyword
 *         description: group name or user name
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: RoleInfo
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
router.get('/search/userOrGroup', (req, res) => {
  service.searchUserOrGroup(req.query, (err, docs) =>
    res.json(result.json(err, docs)));
});

module.exports = router;
