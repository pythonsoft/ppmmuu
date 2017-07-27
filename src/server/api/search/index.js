/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');

/**
 * @apiName: solrSearch
 * @apiFuncType: get
 * @apiFuncUrl: /search/solrSearch
 * @swagger
 * /search/solrSearch:
 *   get:
 *     description: get solr search
 *     version: 1.0.0
 *     tags:
 *       - v1
 *       - Search
 *     produces:
 *       - application/json
 *     parameters:
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
 *         default: 999
 *         collectionFormat: csv
 *       - in: query
 *         name: keyword
 *         description:
 *         required: false
 *         type: string
 *         example: "添加"
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           properties:
 *            status:
 *              type: string
 *            data:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *            statusInfo:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
router.get('/solrSearch', (req, res) => {
  service.solrSearch(req.query, (err, doc) => res.json(result.json(err, doc)));
});

module.exports = router;
