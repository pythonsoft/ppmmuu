'use strict';

const express = require('express');
const request = require('request');

const router = express.Router();

const isLogin = require('../../middleware/login');
const result = require('../../common/result');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionGroup: requests
 * @permissionName: 发送请求
 * @permissionPath: /requests
 * @apiName: sendRequests
 * @apiFuncType: post
 * @apiFuncUrl: /requests
 * @swagger
 * /requests:
 *   post:
 *     description: 发送请求
 *     tags:
 *       - v1
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 发送请求
 *         schema:
 *           type: object
 *           properties:
 *             path:
 *               type: string
 *               example: "get_report"
 *             params:
 *               type: string
 *               example: '{"reporttype": "2", "params": {"startdatetime": "2017111101", "enddatetime": "2017111111"}}'
 *     responses:
 *       200:
 *         description: res
 */
router.post('/', (req, res) => {
  let form;
  try {
    form = JSON.parse(req.body.params);
  } catch (e) {
    return res.json(result.json(e));
  }
  const options = { method: `${req.body.method || 'POST'}`,
    url: `http://${req.body.hostname || 'w2.phoenixtv.com'}/mamapi/${req.body.path || 'get_report'}`,
    headers:
    { 'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded' },
    // form: { reporttype: '1', params: '{"programtype":1}' }
    form,
  };

  request(options, (error, response, body) => {
    if (error) {
      return res.json(result.json(error));
    }

    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.json(result.json(e));
    }

    if (body.status != 0) {
      return res.json(result.json({ code: 1, message: body.result.errorMsg }));
    }

    return res.json(result.json(null, body.result));
  });
});


module.exports = router;
