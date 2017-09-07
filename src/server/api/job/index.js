/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName: download
 * @permissionPath: /job/download
 * @apiName: download
 * @apiFuncType: post
 * @apiFuncUrl: /job/download
 * @swagger
 * /job/download:
 *   get:
 *     description: download task create
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: objectid
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: inpoint
 *         description:
 *         required: false
 *         type: integer
 *         default: 0
 *         collectionFormat: csv
 *       - in: body
 *         name: outpoint
 *         description:
 *         required: true
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: body
 *         name: fileName
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/download', (req, res) => {
  const objectid = req.body.objectid;
  const inpoint = req.body.inpoint || 0;
  const outpoint = req.body.outpoint;
  const fileName = req.body.fileName;

  res.set('Content-Type', 'application/json');
  service.download({ objectid, inpoint: inpoint * 1, outpoint: outpoint * 1, fileName }, res);
});

module.exports = router;
