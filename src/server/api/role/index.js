/**
 * Created by steven on 17/5/5.
 */
const express = require('express');
const router = express.Router();
const uuid = require('uuid');

const result = require('../../common/result');

const RoleInfo = require("./roleInfo");
const roleInfo = new RoleInfo();

const PermissionInfo = require("./permissionInfo");
const permissionInfo = new PermissionInfo();

const config = require("../../config");
const redisClient = config.redisClient;

const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

const service = require('./service');

/**
 * @permissionName: 角色列表
 * @permissionPath: /api/role/list
 * @apiName: getRoleList
 * @apiFuncType: get
 * @apiFuncUrl: /api/role/list
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
 *       - in: path
 *         name: page
 *         description:
 *         required: false
 *         type: integer
 *         example: 1
 *         collectionFormat: csv
 *       - in: path
 *         name: pageSize
 *         description:
 *         required: false
 *         type: integer
 *         example: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/list', (req, res)=> {
  let page = req.query.page || 1;
  let pageSize = req.query.pageSize || 30;

  service.listRole(page, pageSize, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 角色详情
 * @permissionPath: /api/role/getDetail
 * @apiName: getRoleDetail
 * @apiFuncType: get
 * @apiFuncUrl: /api/role/getDetail
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
 *       - in: path
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         example: "1c6ad690-5583-11e7-b784-69097aa4b384"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RoleInfo
 */
router.get('/getDetail', (req, res)=> {
  let id = req.query._id || "";

  service.getRoleDetail(id, function(err, doc) {
    return res.json(result.json(err, doc));
  });

});

/**
 * @permissionName: 增加角色
 * @permissionPath: /api/role/add
 * @apiName: postAddRole
 * @apiFuncType: post
 * @apiFuncUrl: /api/role/add
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
 *            - name
 *            - permissions
 *           properties:
 *             name:
 *               type: string
 *               example: admin
 *             permissions:
 *               type: string
 *               example: "/api/role/list,/api/role/getDetail"
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
router.post('/add', (req, res)=> {
  service.addRole(req.body, function(err, r) {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionName: 更新角色
 * @permissionPath: /api/role/update
 * @apiName: postUpdateRole
 * @apiFuncType: post
 * @apiFuncUrl: /api/role/update
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
 *            - name
 *            - permissions
 *            - _id
 *           properties:
 *             name:
 *               type: string
 *               example: admin
 *             permissions:
 *               type: string
 *               example: "/api/role/list,/api/role/getDetail,/api/role/delete,/api/role/listPermissions"
 *             _id:
 *               type: string
 *               example: "1c6ad690-5583-11e7-b784-69097aa4b384"
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
router.post('/update', (req, res)=> {
  service.updateRole(req.body._id, req.body, function(err, r) {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionName: 删除角色
 * @permissionPath: /api/role/delete
 * @apiName: postDeleteRole
 * @apiFuncType: post
 * @apiFuncUrl: /api/role/delete
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
router.post('/delete', (req, res)=> {
  service.deleteRoles(req.body.ids, function(err, r) {
    res.json(result.json(err, {}));
  });
});

/**
 * @permissionName: 权限列表
 * @permissionPath: /api/role/listPermission
 * @apiName: getPermissionList
 * @apiFuncType: get
 * @apiFuncUrl: /api/role/listPermission
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
 *       - in: path
 *         name: page
 *         description:
 *         required: false
 *         type: integer
 *         example: 1
 *         collectionFormat: csv
 *       - in: path
 *         name: pageSize
 *         description:
 *         required: false
 *         type: integer
 *         example: 30 default
 *         collectionFormat: csv
 *         - in: path
 *         name: sortFields
 *         description: sort by this params
 *         required: false
 *         type: string
 *         example: '-createdTime' that means sort by createdTime dec
 *         collectionFormat: csv
 *         - in: path
 *         name: fieldsNeed
 *         description: request only you need fields
 *         required: false
 *         type: string
 *         example: '-name,createdTime' that means i need createdTime, don't need name field, if you need all fields, let it empty
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: PermissionInfo
 */
router.get('/listPermission', (req, res)=> {
  const roleId = req.query['roleId'];
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  const sortFields = req.query['sortFields'] || '-createdTime';
  const fieldsNeed = req.query['fieldsNeed'];

  service.listPermission(roleId, page, pageSize, sortFields, fieldsNeed, function(err, docs) {
    res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 分配角色
 * @permissionPath: /api/role/assignRoleToUser
 * @apiName: postAssignRoleToUser
 * @apiFuncType: post
 * @apiFuncUrl: /api/role/assignRoleToUser
 * @swagger
 * /role/assignRoleToUser:
 *   post:
 *     description: assign role to user
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - RoleInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: assign role to user
 *         schema:
 *           type: object
 *           required:
 *            - roles
 *            - userIds
 *           properties:
 *             roles:
 *               type: string
 *               example: admin,guest,support
 *             userIds:
 *               type: string
 *               example: xuyawen@phoenixtv.com,131@qq.com
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
router.post('/assignRoleToUser', (req, res)=> {
  const roles = req.body['roles'];
  const userIds = req.body['userIds'];

  service.assignUserRole(userIds, roles, function(err, r) {
    res.json(result.json(err, 'ok'));
  });
});

module.exports = router;
