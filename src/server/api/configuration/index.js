'use strict';

const express = require('express');
const uuid = require('uuid');

const router = express.Router();

const result = require('../../common/result');

const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

const service = require('./service');

router.post('/add', (req, res) => {
  req.body._id = uuid();
  service.addConfig(req.body, err => res.json(result.json(err, {})));
});

router.post('/update', (req, res) => {
  service.updateConfig(req.body._id, req.body, err => res.json(result.json(err, {})));
});

router.get('/list', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;
  service.listConfig(page, pageSize, req.query.groupId, (err, docs) => {
    res.json(result.json(err, docs));
  });
});

router.post('/delete', (req, res) => {
  service.deleteConfig(req.body._id, err => res.json(result.json(err, {})));
});

router.post('/addGroup', (req, res) => {
  req.body._id = uuid();
  service.addConfigGroup(req.body, err => res.json(result.json(err, {})));
});

router.post('/updateGroup', (req, res) => {
  service.updateConfigGroup(req.body._id, req.body, err => res.json(result.json(err, {})));
});

router.get('/listGroup', (req, res) => {
  service.listConfigGroup((err, docs) => {
    res.json(result.json(err, docs));
  });
});

router.post('/deleteGroup', (req, res) => {
  service.deleteConfigGroup(req.body._id, err => res.json(result.json(err, {})));
});

module.exports = router;
