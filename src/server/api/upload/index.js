'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');
const upload = require('../../common/multer').upload;
const config = require('../../config');
const fs = require('fs');
const request = require('request');
const i18n = require('i18next');
const utils = require('../../common/utils');

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
  const file = req.file || '';
  if(!file){
    return res.json(result.json(i18n.t('noFileUpload')));
  }
  const filePath = file.filename;
  const fileName = `${config.domain}/uploads/${filePath}`;
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
  const file = req.file;
  if(!file){
    return res.json(result.json(i18n.t('noFileUpload')));
  }
  const filePath = file.path || '';
  const formData = {
    file: fs.createReadStream(filePath),
  };
  const url = `http://${config.TRANSCODE_API_SERVER.hostname}:${config.TRANSCODE_API_SERVER.port}/TemplateService/uploadFile`;
  //const url = 'http://localhost:8080/upload';
  console.log(url);
  const up = request.post(url, (err, httpResponse, body) => {
    if (err) {
      return res.json(result.fail(err));
    }
    console.log("resbody==>", httpResponse.statusCode);
    return res.end(body);
  });
  const form = up.form();
  form.append('file', fs.createReadStream(filePath), file.filename);
  form.append('chunk', 0);
});

module.exports = router;
