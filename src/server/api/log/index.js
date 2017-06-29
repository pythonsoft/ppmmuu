/**
 * Created by steven on 17/5/5.
 */
const express = require('express');
const router = express.Router();
const result = require('../../common/result');

/**
 * @apiName: postLogTest
 * @apiFuncType: post
 * @apiFuncUrl: /api/log/test
 * @swagger
 * /log/test/:
 *   post:
 *     description: log test
 *     tags:
 *       - v1
 *       - log
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: log
 *         schema:
 *           type: object
 *           required:
 *            - logName
 *            - error
 *           properties:
 *             logName:
 *               type: string
 *             error:
 *               type: string
 *     responses:
 *       200:
 *         description: log
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: object
 *              properties:
 *                log:
 *                  type: string
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *
 */
router.post('/test', (req, res)=> {
  return res.json(result.success({log: "test"}));
});

module.exports = router;
