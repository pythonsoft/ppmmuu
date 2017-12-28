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
 *             hostname:
 *               type: string
 *               example: "w2.phoenixtv.com"
 *             port:
 *               type: string
 *               example: "80"
 *             path:
 *               type: string
 *               example: "/mamapi/get_report"
 *             params:
 *               type: string
 *               example: '{"reporttype": "1", "params": {"programtype": "1"}}'
 *             method:
 *               type: string
 *               example: "post"
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
  const options = { method: 'POST',
    url: `http://${req.body.hostname || 'w2.phoenixtv.com'}${req.body.path || '/mamapi/get_report'}`,
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

    return res.json(result.json(null, body));
  });
});


module.exports = router;
