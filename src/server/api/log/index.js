/**
 * Created by steven on 17/5/5.
 */
var express = require('express');
var router = express.Router();


router.get('/test', (req, res)=> {
  return res.json({'status': 0, data: {log: "ddda"}});
});

module.exports = router;