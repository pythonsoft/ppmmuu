/**
 * Created by chaoningx on 17/10/19.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const isLogin = require('../../middleware/login');
const upload = require('./storage').upload;
const service = require('./service');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: managementAbout
 * @permissionName: 上传升级包
 * @permissionPath: /help/uploadPackage
 * @apiName: uploadPackage
 * @apiFuncType: post
 * @apiFuncUrl: /help/uploadPackage
 * @swagger
 * /help/uploadPackage:
 *   post:
 *     description: upgrade package
 *     tags:
 *       - v1
 *       - help
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: upgrade package
 *     responses:
 *       200:
 *         description: upgrade package
 */
router.post('/uploadPackage', upload.single('file'), (req, res) => {
  const file = req.file;
  service.upload({
    name: file.filename,
    packagePath: file.path,
    description: 'upload package completely.',
  }, req.ex.userInfo._id, req.ex.userInfo.name, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionGroup: managementAbout
 * @permissionName: 安装升级包
 * @permissionPath: /help/installPackage
 * @apiName: installPackage
 * @apiFuncType: post
 * @apiFuncUrl: /help/installPackage
 * @swagger
 * /help/installPackage:
 *   post:
 *     description: install package
 *     tags:
 *       - v1
 *       - help
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         id:
 *           type: string
 *           description: ""
 *           example: ""
 *     responses:
 *       200:
 *         description: install package
 */
router.post('/installPackage', (req, res) => {
  service.install(req.body.id, err => res.json(result.json(err, 'ok')));
});

/**
 * @permissionGroup: managementAbout
 * @permissionName: 列举安装包内的目录及文件
 * @permissionPath: /help/listPackage
 * @apiName: listPackage
 * @apiFuncType: get
 * @apiFuncUrl: /help/listPackage
 * @swagger
 * /help/listPackage:
 *   get:
 *     description: list package directory or file
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - VersionInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: path
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: VersionInfo
 */
router.get('/listPackage', (req, res) => {
  const id = req.query.id;
  const pathName = req.query.path || '';

  service.list(id, pathName, (err, files) => res.json(result.json(err, files)));
});

/**
 * @permissionGroup: managementAbout
 * @permissionName: 读取文件内容
 * @permissionPath: /help/readFile
 * @apiName: readFile
 * @apiFuncType: get
 * @apiFuncUrl: /help/readFile
 * @swagger
 * /help/readFile:
 *   get:
 *     description: list package directory or file
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - VersionInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: filePath
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: VersionInfo
 */
router.get('/readFile', (req, res) => {
  const id = req.query.id;
  const filePath = req.query.filePath || '';

  service.readFile(id, filePath, (err, data) => res.json(result.json(err, data)));
});

/**
 * @permissionGroup: managementAbout
 * @permissionName: 安装版本详细信息
 * @permissionPath: /help/detail
 * @apiName: detail
 * @apiFuncType: get
 * @apiFuncUrl: /help/detail
 * @swagger
 * /help/detail:
 *   get:
 *     description: get version detail
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - VersionInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: filePath
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: VersionInfo
 */
router.get('/detail', (req, res) => {
  service.getDetail(req.query.id, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
