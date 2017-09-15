/**
 * Created by steven on 17/5/5.
 */

'use strict';

const express = require('express');

const router = express.Router();
const service = require('./service');
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName: download
 * @permissionPath: /job/download
 * @apiName: download
 * @apiFuncType: post
 * @apiFuncUrl: /job/download
 * @swagger
 * /job/download:
 *   get:
 *     description: download task create
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: objectid
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *       - in: body
 *         name: inpoint
 *         description:
 *         required: false
 *         type: integer
 *         default: 0
 *         collectionFormat: csv
 *       - in: body
 *         name: outpoint
 *         description:
 *         required: true
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: body
 *         name: fileName
 *         description:
 *         required: true
 *         type: string
 *         default: ''
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/download', (req, res) => {
  const objectid = req.body.objectid;
  const inpoint = req.body.inpoint || 0;
  const outpoint = req.body.outpoint;
  const fileName = req.body.fileName;

  res.set('Content-Type', 'application/json');
  service.download({ objectid, inpoint: inpoint * 1, outpoint: outpoint * 1, fileName }, res);
});

/**
 * @permissionName: createTemplate
 * @permissionPath: /job/createTemplate
 * @apiName: createTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /job/createTemplate
 * @swagger
 * /job/createTemplate:
 *   post:
 *     description: create template
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: createJson
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/createTemplate', (req, res) => {
  const template = req.body.createJson;
  res.set('Content-Type', 'application/json');
  service.createJson({ template }, res);
});

/**
 * @permissionName: updateTemplate
 * @permissionPath: /job/updateTemplate
 * @apiName: updateTemplate
 * @apiFuncType: post
 * @apiFuncUrl: /job/updateTemplate
 * @swagger
 * /job/updateTemplate:
 *   post:
 *     description: updateTemplate
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: updateJson
 *         required: true
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description:
 */
router.post('/updateTemplate', (req, res) => {
  const template = req.body.updateJson;
  res.set('Content-Type', 'application/json');
  service.updateJson({ template }, res);
});

/**
 * @permissionName: listJob
 * @permissionPath: /job/list
 * @apiName: listJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/list
 * @swagger
 * /job/list:
 *   get:
 *     description: list task
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         type: int
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: int
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: taskList
 */
router.get('/list', (req, res) => {
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  const status = req.query.status;
  const currentStep = req.query.currentStep;

  res.set('Content-Type', 'application/json');
  service.list({ page: page * 1, pageSize: pageSize * 1, status, currentStep }, res);
});

/**
 * @permissionName: listTemplate
 * @permissionPath: /job/listTemplate
 * @apiName: listTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /job/listTemplate
 * @swagger
 * /job/listTemplate:
 *   get:
 *     description: list template
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         type: int
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: int
 *         default: 99
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/listTemplate', (req, res) => {
  const page = req.query.page;
  const pageSize = req.query.pageSize;

  res.set('Content-Type', 'application/json');
  service.listTemplate({ page: page * 1, pageSize: pageSize * 1 }, res);
});

/**
 * @permissionName: queryJob
 * @permissionPath: /job/query
 * @apiName: queryJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/query
 * @swagger
 * /job/query:
 *   get:
 *     description: query job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/query', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.query({ jobId }, res);
});

/**
 * @permissionName: restartJob
 * @permissionPath: /job/restart
 * @apiName: restartJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/restart
 * @swagger
 * /job/restart:
 *   get:
 *     description: restart job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/restart', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.restart({ jobId }, res);
});

/**
 * @permissionName: stopJob
 * @permissionPath: /job/stop
 * @apiName: stopJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/stop
 * @swagger
 * /job/stop:
 *   get:
 *     description: stop job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/stop', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.stop({ jobId }, res);
});

/**
 * @permissionName: deleteJob
 * @permissionPath: /job/delete
 * @apiName: deleteJob
 * @apiFuncType: get
 * @apiFuncUrl: /job/delete
 * @swagger
 * /job/delete:
 *   get:
 *     description: delete job
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: jobId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/delete', (req, res) => {
  const jobId = req.query.jobId;
  res.set('Content-Type', 'application/json');
  service.delete({ jobId }, res);
});

/**
 * @permissionName: deleteTemplate
 * @permissionPath: /job/deleteTemplate
 * @apiName: deleteTemplate
 * @apiFuncType: get
 * @apiFuncUrl: /job/deleteTemplate
 * @swagger
 * /job/deleteTemplate:
 *   get:
 *     description: delete
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: templateId
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: templateList
 */
router.get('/deleteTemplate', (req, res) => {
  const id = req.query.templateId;
  res.set('Content-Type', 'application/json');
  service.deleteTemplate({ id }, res);
});

module.exports = router;
