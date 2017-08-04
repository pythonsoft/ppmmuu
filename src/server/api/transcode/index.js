/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName:
 * @permissionPath: /transcode/list
 * @apiName: list
 * @apiFuncType: get
 * @apiFuncUrl: /transcode/list
 * @swagger
 * /transcode/list:
 *   get:
 *     description: list transcode task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       -
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: //帧索引创建  divideFile, //文件分割 transcoding, //转码 mergeFile //文件合并
 *         required: false
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: query
 *         name: currentStep
 *         description: 过滤出状态为currentStep 的记录 created, //创建 dealing, //处理中 error,//错误 complete //完成
 *         required: false
 *         type: string
 *         default: ''
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
 *         default: 20
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: EngineGroupInfo
 */
router.get('/list', (req, res) => {
  const status = req.query.status;
  const currentStep = req.query.currentStep;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 20;

  service.listAllParentTask(status, currentStep, page, pageSize, (err, docs) => res.json(result.json(err, docs)));
});

module.exports = router;
