/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();

const result = require('../../common/result');

const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

const service = require('./service');

router.get('/listBucket', (req, res) => {
  const keyword = req.query.keyword;
  const status = req.query.status;
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize;
  const sortFields = req.query.sortFields || '-createdTime';
  const fieldsNeed = req.query.fieldsNeed;

  service.listBucket(keyword, status, page, pageSize, sortFields, fieldsNeed, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

module.exports = router;
