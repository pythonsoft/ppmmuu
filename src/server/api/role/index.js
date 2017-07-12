/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');

const isLogin = require('../../middleware/login');

// router.use(isLogin.middleware);
// router.use(isLogin.hasAccessMiddleware);

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
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/list', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const keyword = req.query.keyword || '';

  service.listRole(page, pageSize, keyword, (err, docs) => res.json(result.json(err, docs)));
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
 *
 */
router.post('/add', (req, res) => {
  service.addRole(req.body, (err) => {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionName: 更新角色
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
router.post('/update', (req, res) => {
  service.updateRole(req.body, (err) => {
    res.json(result.json(err, {}));
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
  const name = req.query.name || '';

  service.listPermission(roleId, status, name, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 分配角色和权限
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
 *            - _id
 *           properties:
 *             roleIds:
 *               type: string
 *               example: admin,guest,support
 *             _id:
 *               type: string
 *               example: xuyawen@phoenixtv.com
 *             allowedPermissions:
 *               type: string
 *               example: "/role/list,/role/add"
 *             deniedPermissions:
 *               type: string
 *               example: "/role/update,/role/delete"
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
 *            - _id
 *            - status
 *           properties:
 *             _id:
 *               type: string
 *               example: "cf46cd70-6512-11e7-904d-edfdde914c9e"
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
 * @permissionName: 用户或部门角色权限详情
 * @permissionPath: /role/getUserOrDepartmentRoleAndPermissions
 * @apiName: getUserOrDepartmentRoleAndPermissions
 * @apiFuncType: post
 * @apiFuncUrl: /role/getUserOrDepartmentRoleAndPermissions
 * @swagger
 * /role/getUserOrDepartmentRoleAndPermissions:
 *   get:
 *     description: get user or department role and permissions
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
 *         default: "043741f0-5cac-11e7-9a4a-5b43dc9cf567"
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
router.get('/getUserOrDepartmentRoleAndPermissions', (req, res) => {
  const _id = req.query._id || '';

  service.getUserOrDepartmentRoleAndPermissions(_id, (err, r) => {
    res.json(result.json(err, r));
  });
});

module.exports = router;
