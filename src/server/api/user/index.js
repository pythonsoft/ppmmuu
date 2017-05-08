/**
 * Created by steven on 17/5/5.
 */
var express = require('express');
var router = express.Router();

/**
 * apiName: getUserDetail
 * apiFuncType: get
 * apiFuncUrl: /api/user/detail
 * @swagger
 * /user/detail:
 *   get:
 *     description: get user detail by _id
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: user _id
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: user
 */
router.get('/detail', (req, res) => {
  return res.json({'status': 0, data: {user: "fffa"}});
});

module.exports = router;