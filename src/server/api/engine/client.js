/**
 * Created by chaoningxie on 2016/12/10.
 */
const path = require('path');
const fs = require('fs');
const utils = require('../../common/utils');
const clientConnect = require('socket.io-client');
const config = require('../../config');

class SocketClient {
  constructor(options) {
    this.settings = Object.assign({
      host: 'localhost',
      port: 8090,
      protocol: 'http',
      path: '/',
    }, options);

    this.socket = null;
  }

  connect(cb) {
    let me = this;

    const url = this.settings.protocol + '://' + me.settings.host + ':' + me.settings.port + me.settings.path;

    console.log('正在连接服务器, ' + url);

    this.socket = clientConnect(url);

    this.socket.on('connect', function() {
      console.log('server connected');
      cb && cb();
    });

    this.socket.on('error', function(err) {
      console.log(err);
    });

    this.socket.on('disconnect', function() {
      setTimeout(function() {
        me.connect(cb);
      }, 2000);

      console.log('disconnect');
    });
  }

};

const sc = new SocketClient(config.engineCenter);

sc.connect();

module.exports = SocketClient;
