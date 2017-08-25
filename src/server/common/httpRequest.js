
'use strict';

const http = require('http');
const utils = require('./utils');
const logger = require('./log')('error');

class httpRequest {
  constructor(options) {
    this.options = Object.assign({
      hostname: '',
      port: '',
      headers: {
        'Transfer-Encoding': 'chunked',
      },
    }, options);
  }

  error(msg) {
    return JSON.stringify({
      status: 1, data: {}, statusInfo: { code: '10000', message: msg },
    });
  }

  request(opt, postData, outStream) {
    const me = this;

    const req = http.request(opt, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];

      let error = null;

      if (statusCode !== 200) {
        error = new Error(`Request Failed. Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.log('error message =>', error.message);
        logger.error(error.message);

        const rs = me.error(error.message);

        if (typeof outStream === 'function') {
          outStream(rs);
        } else {
          outStream.end(rs);
        }

        return false;
      }

      if (typeof outStream === 'function') {
        const buffers = [];
        let len = 0;

        res.on('data', (buf) => {
          len += buf.length;
          buffers.push(buf);
        });

        res.on('end', () => {
          const buffer = new Buffer(len);
          let pos = 0;

          buffers.forEach((n, i) => {
            buffers[i].copy(buffer, pos);
            pos += buffers[i].length;
          });

          outStream(null, JSON.parse(buffer.toString()));
        });
      } else {
        res.pipe(outStream);
      }
    });

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
      outStream.end(JSON.stringify({
        status: 1, data: {}, statusInfo: { code: '10000', message: e.message },
      }));

      logger.error(e.message);
    });

    if (opt.method === 'POST') {
      req.write(JSON.stringify(postData));
    }

    req.end();
  }

  get(path, param, outStream) {
    const opt = utils.clone(this.options);
    opt.method = 'GET';
    opt.path = path;

    const str = [];

    if (param && !utils.isEmptyObject(param)) {
      const keys = Object.keys(param);
      for (let i = 0, len = keys.length; i < len; i++) {
        str.push(`${keys[i]}=${param[keys[i]]}`);
      }
    }

    opt.path = `${opt.path}?${str.join('&')}`;

    this.request(opt, param, outStream);
  }

  post(path, param, outStream) {
    const opt = utils.clone(this.options);
    opt.method = 'POST';
    opt.path = path;

    this.request(opt, param, outStream);
  }

}

module.exports = httpRequest;
