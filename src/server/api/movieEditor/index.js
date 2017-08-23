/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const result = require('../../common/result');
const service = require('./service');
const isLogin = require('../../middleware/login');

const i18n = require('i18next');

const TaskInfo = require('./projectInfo');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

router.get('/listAllParentTask', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 30;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';
  const status = req.query.status || '';
  const userId = req.ex.userInfo._id;

  service.listAllParentTask(userId, status, page, pageSize, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});

router.get('/listChildTask', (req, res) => {
  const ids = req.query.ids;
  const sortFields = req.query.sortFields || '';
  const fieldsNeed = req.query.fieldsNeed || '';

  service.listChildTask(ids, (err, docs) => res.json(result.json(err, docs)), sortFields, fieldsNeed);
});

router.get('/getTaskDetail', (req, res) => {
  service.getTaskDetail(req.query.id, (err, doc) => res.json(result.json(err, doc)));
});

router.post('/addParentTask', (req, res) => {
  const info = req.body;
  const creatorId = req.ex.userInfo._id;
  const creatorName = req.ex.userInfo.name;
  const creatorType = TaskInfo.CREATOR_TYPE.USER;

  service.addTask(creatorId, creatorName, creatorType, info, null, err => res.json(result.json(err, 'ok')));
});

router.post('/addChildTask', (req, res) => {
  const parentId = req.body.parentId;
  const childTasks = req.body.childTasks;
  const creatorId = req.ex.userInfo._id;
  const creatorName = req.ex.userInfo.name;
  const creatorType = TaskInfo.CREATOR_TYPE.USER;

  try {
    const tasks = JSON.parse(childTasks);
    service.addChildTasks(creatorId, creatorName, creatorType, parentId, tasks, err => res.json(result.json(err, 'ok')));
  } catch (e) {
    return res.json(result.fail(i18n.t('jsonParseError')));
  }
});

router.post('/updateTask', (req, res) => {
  service.updateTask(req.body.id, req.body, err => res.json(result.json(err, 'ok')));
});

router.post('/deleteTask', (req, res) => {
  service.deleteTasks(req.body.ids, err => res.json(result.json(err, 'ok')));
});

module.exports = router;
