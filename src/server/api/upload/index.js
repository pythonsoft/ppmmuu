'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');
const upload = require('../../common/multer').upload;
const config = require('../../config');
const fs = require('fs');
const path = require('path');
const i18n = require('i18next');
const utils = require('../../common/utils');
const uuid = require('uuid');

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
 *         name: file
 *         type: file
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: UploadResult
 */
router.post('/', upload.single('file'), (req, res) => {
  const file = req.file || '';
  if (!file) {
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
 *         name: file
 *         type: file
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: UploadResult
 */
router.post('/uploadWatermark', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.json(result.json(i18n.t('noFileUpload')));
  }
  const filePath = file.path || '';
  const formData = {
    file: fs.createReadStream(filePath),
  };
  const url = `http://${config.TRANSCODE_API_SERVER.hostname}:${config.TRANSCODE_API_SERVER.port}/TemplateService/uploadFile`;
  utils.baseRequestUploadFile(url, formData, '', (err, rs) => res.end(rs));
});

/**
 * @apiName: uploadBase64
 * @apiFuncType: post
 * @apiFuncUrl: /upload/uploadBase64
 * @swagger
 * /upload/uploadBase64:
 *   post:
 *     description: uploadBase64 img
 *     tags:
 *       - v1
 *       - Upload
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: uploadBase64 img
 *         schema:
 *           type: object
 *           required:
 *             - base64
 *           properties:
 *             base64:
 *               type: string
 *               example: ''
 *     responses:
 *       200:
 *         description: UploadResult
 */
router.post('/uploadBase64', (req, res) => {
  const base64Data = req.body.base64.replace(/^data:image\/png;base64,/, '');
  const fileName = uuid.v1();
  const filePath = path.join(config.uploadPath, fileName);

  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      return res.json(result.fail(i18n.t('uploadBase64Error', { error: err.message })));
    }
    const url = `${config.domain}/uploads/${fileName}`;
    return res.json(result.success(url));
  });
});

module.exports = router;
