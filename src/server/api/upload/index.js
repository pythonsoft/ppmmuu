'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');
const upload = require('../../common/multer').upload;
const config = require('../../config');

/**
 * @permissionName: 上传图片
 * @permissionPath: /upload/
 * @apiName: upload
 * @apiFuncType: post
 * @apiFuncUrl: /upload
 * @swagger
 * /upload:
 *   post:
 *     description: upload image
 *     tags:
 *       - v1
 *       - Upload
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: UploadResult
 */
router.post('/', upload.single('file'), (req, res) => {
  let filePath = req.file.path;
  filePath = filePath.split('/');
  const fileName = `${config.domain}/uploads/${filePath[filePath.length - 1]}`;
  res.status(200).json(result.json('', fileName));
});

module.exports = router;
