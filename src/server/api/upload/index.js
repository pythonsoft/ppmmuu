'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');
const upload = require('../../common/multer').upload;
const config = require('../../config');
const fs = require('fs');
const request = require('request');
const path = require('path');

/**
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

/**
 * @apiName: uploadWatermark
 * @apiFuncType: post
 * @apiFuncUrl: /upload/uploadWatermark
 * @swagger
 * /upload/uploadWatermark:
 *   post:
 *     description: upload watermark
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
router.post('/uploadWatermark', upload.single('file'), (req, res) => {
  let filePath = req.file.path;
  const formData = {
      file: fs.createReadStream(filePath),
  };
  const url = 'http://' + config.JOB_API_SERVER.host + ':' + config.JOB_API_SERVER.port + '/TemplateService/uploadFile';
  //const url = 'http://localhost:8080/upload';
  request.post({url: url, formData: formData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return res.json(result.fail(err));
    }
    return res.end(body);
  });
});

module.exports = router;
