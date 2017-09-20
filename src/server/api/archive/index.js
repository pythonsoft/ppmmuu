'use strict';

const express = require('express');

const router = express.Router();
const service = require('./service');

const isLogin = require('../../middleware/login');
const result = require('../../common/result');

router.use(isLogin.middleware);
router.use(isLogin.hasAccessMiddleware);

/**
 * @permissionName: listArchiveTask
 * @permissionPath: /archive/listTask
 * @apiName: listArchiveTask
 * @apiFuncType: get
 * @apiFuncUrl: /archive/listTask
 * @swagger
 * /archive/listTask:
 *   get:
 *     description: listArchiveTask
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: listArchiveTask
 */
router.get('/listTask', (req, res) => {
  const status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.listArchiveTask({ status, page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: changeArchiveTaskState
 * @permissionPath: /archive/changeTaskState
 * @apiName: changeArchiveTaskState
 * @apiFuncType: get
 * @apiFuncUrl: /archive/changeTaskState
 * @swagger
 * /archive/changeTaskState:
 *   get:
 *     description: changeArchiveTaskState
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: changeArchiveTaskState
 */
router.get('/changeTaskState', (req, res) => {
  const status = req.query.status || '';
  const id = req.query.id || '';

  service.changeArchiveTaskState({ status, id }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindArchiveTaskByObjectId
 * @permissionPath: /archive/findTaskByObjectId
 * @apiName: FindArchiveTaskByObjectId
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findTaskByObjectId
 * @swagger
 * /archive/findTaskByObjectId:
 *   get:
 *     description: FindArchiveTaskByObjectId
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: objectId
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindArchiveTaskByObjectId
 */
router.get('/findTaskByObjectId', (req, res) => {
  const objectId = req.query.objectId || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.FindArchiveTaskByObjectId({ objectId, page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindArchiveTaskByTaskName
 * @permissionPath: /archive/findTaskByTaskName
 * @apiName: FindArchiveTaskByTaskName
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findTaskByTaskName
 * @swagger
 * /archive/findTaskByTaskName:
 *   get:
 *     description: FindArchiveTaskByTaskName
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: taskName
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindArchiveTaskByTaskName
 */
router.get('/findTaskByTaskName', (req, res) => {
  const taskName = req.query.taskName || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.FindArchiveTaskByTaskName({ taskName, page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindDownloadTask
 * @permissionPath: /archive/findDownloadTask
 * @apiName: FindDownloadTask
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findDownloadTask
 * @swagger
 * /archive/findDownloadTask:
 *   get:
 *     description: FindDownloadTask
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindDownloadTask
 */
router.get('/findDownloadTask', (req, res) => {
  const status = req.query.status || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.FindDownloadTask({ status, page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindDownloadTaskByTaskName
 * @permissionPath: /archive/findDownloadTaskByTaskName
 * @apiName: FindDownloadTaskByTaskName
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findDownloadTaskByTaskName
 * @swagger
 * /archive/findDownloadTaskByTaskName:
 *   get:
 *     description: FindDownloadTaskByTaskName
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: taskName
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindDownloadTaskByTaskName
 */
router.get('/findDownloadTaskByTaskName', (req, res) => {
  const taskName = req.query.taskName || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.FindDownloadTaskByTaskName({ taskName, page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: ChangeDownloadTaskState
 * @permissionPath: /archive/changeDownloadTaskState
 * @apiName: ChangeDownloadTaskState
 * @apiFuncType: get
 * @apiFuncUrl: /archive/changeDownloadTaskState
 * @swagger
 * /archive/changeDownloadTaskState:
 *   get:
 *     description: ChangeDownloadTaskState
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ChangeDownloadTaskState
 */
router.get('/changeDownloadTaskState', (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '';

  service.ChangeDownloadTaskState({ id, status }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindAllClient
 * @permissionPath: /archive/findAllClient
 * @apiName: FindAllClient
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findAllClient
 * @swagger
 * /archive/findAllClient:
 *   get:
 *     description: FindAllClient
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *         default: 1
 *         collectionFormat: csv
 *       - in: query
 *         name: pageSize
 *         type: integer
 *         default: 999
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindAllClient
 */
router.get('/findAllClient', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 999;

  service.FindAllClient({ page, pageSize }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: FindClient
 * @permissionPath: /archive/findClient
 * @apiName: FindClient
 * @apiFuncType: get
 * @apiFuncUrl: /archive/findClient
 * @swagger
 * /archive/findClient:
 *   get:
 *     description: FindClient
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: FindClient
 */
router.get('/findClient', (req, res) => {
  const id = req.query.id || '';

  service.FindClient({ id }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: RemoveClient
 * @permissionPath: /archive/removeClient
 * @apiName: RemoveClient
 * @apiFuncType: get
 * @apiFuncUrl: /archive/removeClient
 * @swagger
 * /archive/removeClient:
 *   get:
 *     description: RemoveClient
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: RemoveClient
 */
router.get('/removeClient', (req, res) => {
  const id = req.query.id || '';

  service.RemoveClient({ id }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: AddClient
 * @permissionPath: /archive/addClient
 * @apiName: AddClient
 * @apiFuncType: get
 * @apiFuncUrl: /archive/addClient
 * @swagger
 * /archive/addClient:
 *   get:
 *     description: AddClient
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         type: integer
 *         collectionFormat: csv
 *       - in: query
 *         name: ip
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: description
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: AddClient
 */
router.get('/addClient', (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '';
  const ip = req.query.ip || '';
  const description = req.query.description || '';


  service.AddClient({ id, description, ip, status }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: UpdateClient
 * @permissionPath: /archive/updateClient
 * @apiName: UpdateClient
 * @apiFuncType: get
 * @apiFuncUrl: /archive/updateClient
 * @swagger
 * /archive/updateClient:
 *   get:
 *     description: UpdateClient
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         type: integer
 *         collectionFormat: csv
 *       - in: query
 *         name: ip
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: description
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: UpdateClient
 */
router.get('/updateClient', (req, res) => {
  const id = req.query.id || '';
  const status = req.query.status || '';
  const ip = req.query.ip || '';
  const description = req.query.description || '';


  service.UpdateClient({ id, description, ip, status }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: BatchUpdateClientState
 * @permissionPath: /archive/batchUpdateClientState
 * @apiName: BatchUpdateClientState
 * @apiFuncType: get
 * @apiFuncUrl: /archive/batchUpdateClientState
 * @swagger
 * /archive/batchUpdateClientState:
 *   get:
 *     description: BatchUpdateClientState
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ids
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: status
 *         type: integer
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: BatchUpdateClientState
 */
router.get('/batchUpdateClientState', (req, res) => {
  const ids = req.query.ids || '';
  const status = req.query.status || '';

  service.BatchUpdateClientState({ ids, status }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: SearchUdsKeyByObjectIDList
 * @permissionPath: /archive/searchUdsKeyByObjectIDList
 * @apiName: SearchUdsKeyByObjectIDList
 * @apiFuncType: get
 * @apiFuncUrl: /archive/searchUdsKeyByObjectIDList
 * @swagger
 * /archive/searchUdsKeyByObjectIDList:
 *   get:
 *     description: SearchUdsKeyByObjectIDList
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ids
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: SearchUdsKeyByObjectIDList
 */
router.get('/searchUdsKeyByObjectIDList', (req, res) => {
  const ids = req.query.ids || '';

  service.SearchUdsKeyByObjectIDList({ ids }, (err, r) => res.json(result.json(err, r)));
});

/**
 * @permissionName: ManualCreateDownloadTask
 * @permissionPath: /archive/manualCreateDownloadTask
 * @apiName: ManualCreateDownloadTask
 * @apiFuncType: get
 * @apiFuncUrl: /archive/manualCreateDownloadTask
 * @swagger
 * /archive/manualCreateDownloadTask:
 *   get:
 *     description: ManualCreateDownloadTask
 *     version: 1.0.0
 *     tags:
 *       - v1
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ids
 *         type: string
 *         collectionFormat: csv
 *       - in: query
 *         name: Path
 *         type: string
 *         collectionFormat: csv
 *     responses:
 *       200:
 *         description: ManualCreateDownloadTask
 */
router.get('/manualCreateDownloadTask', (req, res) => {
  const ids = req.query.ids || '';
  const path = req.query.path || '';

  service.ManualCreateDownloadTask({ ids, path }, (err, r) => res.json(result.json(err, r)));
});

module.exports = router;
