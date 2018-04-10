'use strict';
const path = require('path');
const config = require('../../config');

const APPLE_PEM_BASE_PATH = path.join(config.pemPath, 'apple');


console.log('APPLE_PEM_BASE_PATH -->', APPLE_PEM_BASE_PATH);

const service = {};

service.push = function() {

};

module.exports = service;
