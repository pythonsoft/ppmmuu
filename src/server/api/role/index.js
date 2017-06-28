/**
 * Created by steven on 17/5/5.
 */
var express = require('express');
var router = express.Router();
const uuid = require('uuid');
const Result = require('../../common/result');
const isLogin = require('../../middleware/login');
const RoleInfo = require("./roleInfo");
const PermissionInfo = require("./permissionInfo");
const UserInfo = require("../user/userInfo");
const roleInfo = new RoleInfo();
const permissionInfo = new PermissionInfo();
const userInfo = new UserInfo();
const config = require("../../config");
const redisClient = config.redisClient;

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

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
  let pageSize = req.query.pageSize || 999;

  page = page * 1;
  pageSize = pageSize * 1;
  roleInfo.pagination({}, page, pageSize, function(err, docs){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }

    return res.json(Result.SUCCESS(docs));
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
  let _id = req.query._id || "";

  if(!_id){
    return res.json(Result.FAIL(req.t('getRoleNoId.code'), {}, req.t('getRoleNoId.message')));
  }

  roleInfo.collection.findOne({ _id: _id}, function(err, doc){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }

    return res.json(Result.SUCCESS(doc));
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
  let name = req.body.name || '';
  let permissions = req.body.permissions || "";
  let info = {};

  if(!name){
    return res.json(Result.FAIL(req.t('addRoleNoName.code'), {}, req.t('addRoleNoName.message')));
  }

  if(!permissions){
    return res.json(Result.FAIL(req.t('addRoleNoPermissions.code'), {}, req.t('addRoleNoPermissions.message')));
  }

  info._id = uuid.v1();
  info.name = name;
  info.permissions = permissions.split(",");
  roleInfo.collection.findOne({ name: name}, { fields: { _id: 1} }, function(err, doc){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }

    if(doc){
      return res.json(Result.FAIL(req.t('addRoleNameIsExist.code'), {}, req.t('addRoleNameIsExist.message')));
    }

    roleInfo.collection.insertOne(roleInfo.assign(info), function(err, r) {
      if(err){
        return res.json(Result.FAIL(-1, {}, err.message));
      }
      return res.json(Result.SUCCESS({}));
    })
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
  let _id = req.body._id || '';
  let name = req.body.name || '';
  let permissions = req.body.permissions || "";
  let info = {};

  if(!_id){
    return res.json(Result.FAIL(req.t('updateRoleNoId.code'), {}, req.t('updateRoleNoId.message')));
  }

  if(!name){
    return res.json(Result.FAIL(req.t('updateRoleNoName.code'), {}, req.t('updateRoleNoName.message')));
  }

  if(!permissions){
    return res.json(Result.FAIL(req.t('updateRoleNoPermissions.code'), {}, req.t('updateRoleNoPermissions.message')));
  }

  info.name = name;
  info.permissions = permissions.split(",");
  roleInfo.collection.findOne({_id:{$ne: _id}, name: name}, function(err, doc){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }
    if(doc){
      return res.json(Result.FAIL(req.t('updateRoleNameIsAlreadyExist.code'), {}, req.t('updateRoleNameIsAlreadyExist.message')));
    }
    roleInfo.collection.findOneAndUpdate({ _id: _id}, { $set: info }, {returnOriginal: false}, function(err, r){
      if(err){
        return res.json(Result.FAIL('-1', [], err.message));
      }
      return res.json(Result.SUCCESS(r.value));
    });
  })
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
  let _ids = req.body._ids || '';

  if(!_ids){
    return res.json(Result.FAIL(req.t('deleteRoleNoIds.code'), {}, req.t('deleteRoleNoIds.message')));
  }

  _ids = _ids.split(",");

  roleInfo.collection.remove({ _id: {$in: _ids}}, function(err, r){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }
    return res.json(Result.SUCCESS({}));
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
 *         example: 15
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: PermissionInfo
 */
router.get('/listPermission', (req, res)=> {
  let page = req.query.page || 1;
  let pageSize = req.query.pageSize || 999;

  page = page * 1;
  pageSize = pageSize * 1;
  permissionInfo.pagination({}, page, pageSize, function(err, docs){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }

    return res.json(Result.SUCCESS(docs));
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
  let roles = req.body.roles || '';
  let userIds = req.body.userIds || '';
  if(!userIds){
    return res.json(Result.FAIL(req.t('assignRoleNoUserIds.code'), {}, req.t('assignRoleNoUserIds.message')));
  }

  userIds = userIds.split(",");
  roles = roles.split(",");
  userInfo.collection.update({ _id: {$in: userIds}}, {$set: { roles: roles}}, { multi: true}, function(err){
    if(err){
      return res.json(Result.FAIL('-1', [], err.message));
    }
    redisClient.del(userIds);
    return res.json(Result.SUCCESS({}));
  });
});

module.exports = router;