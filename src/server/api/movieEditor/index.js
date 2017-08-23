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

router.get('/init', (req, res) => {
  const userId = req.ex.userInfo._id;
  service.ensureMyResource(userId, (err, doc) => res.json(result.json(err, doc)));
});

router.get('/listItem', (req, res) => {
  const userId = req.ex.userInfo._id;
  const parentId = req.query.parentId;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listItem(
    userId,
    parentId,
    (err, docs) => res.json(result.json(err, docs)),
    sortFields,
    fieldsNeed
  );
});

router.post('/createDirectory', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createDirectory(
    userId,
    req.body.name,
    req.body.parentId,
    {},
    (err, r) => res.json(result.json(err, r))
  );
});

router.post('/createItem', (req, res) => {
  const userId = req.ex.userInfo._id;

  service.createItem(
    userId,
    req.body.name,
    req.body.parentId,
    req.body.snippet,
    {},
    (err, r) => res.json(result.json(err, r))
  )
});

module.exports = router;
