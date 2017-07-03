/**
 * Created by steven on 17/5/5.
 */
const express = require('express');
const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName: 组列表
 * @permissionPath: /api/group/list
 * @apiName: getGroupList
 * @apiFuncType: get
 * @apiFuncUrl: /api/group/list
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
router.get('/list', (req, res)=> {
  let parentId = req.query.parentId || "";
  let page = req.query.page || 1;
  let pageSize = req.query.pageSize || 30;

  service.listGroup(parentId, page, pageSize, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 组的所有子组列表
 * @permissionPath: /api/group/listAllChildGroup
 * @apiName: getAllChildGroupList
 * @apiFuncType: get
 * @apiFuncUrl: /api/group/listAllChildGroup
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
router.get('/listAllChildGroup', (req, res)=> {
  let _id = req.query._id || "";
  let fields = req.query.fields || "";

  service.listAllChildGroup(_id, fields, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 组的详情
 * @permissionPath: /api/group/getDetail
 * @apiName: getGroupDetail
 * @apiFuncType: get
 * @apiFuncUrl: /api/group/getDetail
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
router.get('/getDetail', (req, res)=> {
  let _id = req.query._id || "";

  service.getGroup(_id, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName: 添加组
 * @permissionPath: /api/group/add
 * @apiName: postAddGroup
 * @apiFuncType: post
 * @apiFuncUrl: /api/group/add
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
router.post('/add', (req, res)=> {
  let parentId = req.body.parentId || "";
  let info = req.body;
  let creator = {_id: req.ex.userInfo._id, name: req.ex.userInfo.name};
  info.creator = creator;

  service.addGroup(parentId, info, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName:  更新组
 * @permissionPath: /api/group/update
 * @apiName: postUpdateGroup
 * @apiFuncType: post
 * @apiFuncUrl: /api/group/update
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
router.post('/update', (req, res)=> {
  let _id = req.body._id || "";
  let info = req.body;

  service.updateGroup(_id, info, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});

/**
 * @permissionName:  删除组
 * @permissionPath: /api/group/delete
 * @apiName: postDeleteGroup
 * @apiFuncType: post
 * @apiFuncUrl: /api/group/delete
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
router.post('/delete', (req, res)=> {
  let _id = req.body._id || "";

  service.deleteGroup(_id, function(err, docs) {
    return res.json(result.json(err, docs));
  });
});
module.exports = router;