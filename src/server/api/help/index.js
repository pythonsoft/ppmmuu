/**
 * Created by chaoningx on 17/10/19.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const isLogin = require('../../middleware/login');

const upload = require('./storage').upload;
const config = require('../../config');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: help
 * @permissionName: 上传升级包
 * @permissionPath: /help/installPackage
 * @apiName: installPackage
 * @apiFuncType: post
 * @apiFuncUrl: /help/installPackage
 * @swagger
 * /help/installPackage:
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
router.post('/installPackage', upload.single('file'), (req, res) => {
  const filePath = req.file.path.split('/');
  const fileName = `${config.domain}/uploads/${filePath[filePath.length - 1]}`;
  res.status(200).json(result.json('', fileName));
});

module.exports = router;
