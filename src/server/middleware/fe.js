/**
 * Created by chaoningxie on 26/2/17.
 */
const path = require('path');
const fs = require('fs');
const result = require('../common/result');
const config =  require('../config');

let fe = {};

const routersPath = path.join(__dirname, '../../fe/routers');

fe.middleware = function(req, res, next) {
  const url = req.originalUrl;

  if(path.extname(url) && /^\/api/.test(url)) {
    next();
    return false;
  }

  if(!fs.statSync(path.join(routersPath, url)).isDirectory()) {
    res.render('404');
    return false;
  }

  res.render("index");
};

module.exports = fe;
