/**
 * Created by steven on 17/11/12.
 */

'use strict';

const express = require('express');

const router = express.Router();
const isLogin = require('../../middleware/login');

router.use(isLogin.middleware);

router.get('/', (req, res) => {
  res.end('you found me.');
});

module.exports = router;
