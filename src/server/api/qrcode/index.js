/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const config = require('../../config');

/**
 * @permissionGroup: qrcode
 * @permissionName: 检询二维码扫码状态
 * @permissionPath: /qrcode/query
 * @apiName: qrcodeQuery
 * @apiFuncType: get
 * @apiFuncUrl: /qrcode/query
 * @swagger
 * /qrcode/query:
 *   get:
 *     description: qrcodeQuery
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - QRCodeInfo
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: _id
 *         description:
 *         required: true
 *         type: string
 *         default: ""
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: QRCodeInfo
 */
router.get('/query', (req, res) => {
  const id = req.query._id || '';

  service.query(res, id, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: qrcode
 * @permissionName: 获取二维码
 * @permissionPath: /qrcode/login
 * @apiName: qrcodeLogin
 * @apiFuncType: get
 * @apiFuncUrl: /qrcode/login
 * @swagger
 * /qrcode/login:
 *   get:
 *     description: qrcodeLogin
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - QRCodeInfo
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: QRCodeInfo
 */
router.get('/login', (req, res) => {
  service.createQRCode(`${config.domain}/qrcode/login`, (err, doc) => res.json(result.json(err, doc)));
});

/**
 * @permissionGroup: qrcode
 * @permissionName: 扫二维码
 * @permissionPath: /qrcode/scan
 * @apiName: qrcodeScan
 * @apiFuncType: post
 * @apiFuncUrl: /qrcode/scan
 * @swagger
 * /qrcode/scan:
 *   post:
 *     description: scan
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - QRCodeInfo
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: scan
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - ticket
 *           properties:
 *             id:
 *               type: string
 *               example: ''
 *             ticket:
 *               type: string
 *               example: ''
 *     responses:
 *       200:
 *         description: QRCodeInfo
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
router.post('/scan', (req, res) => {
  const id = req.body.id;
  const ticket = req.body.ticket;

  if(!ticket) {
    return res.redirect(config.journalistCloud);
  }

  service.scan(id, ticket, err => res.json(result.json(err, 'ok')));
});

module.exports = router;
