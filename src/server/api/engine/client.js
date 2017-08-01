/**
 * Created by chaoningxie on 2016/12/10.
 */
const path = require('path');
const fs = require('fs');
const utils = require('../../common/utils');
const clientConnect = require('socket.io-client');

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

    console.log('正在连接服务器('+ me.settings.host + ':' + me.settings.port +')...');

    this.socket = clientConnect(this.settings.protocol + '://' + me.settings.host + ':' + me.settings.port + path);

    this.socket.on('connect', function() {
      console.log('server connected');
      cb && cb();
    });

    this.socket.on('error', function(err) {
      console.log(err);
      process.exit();
    });

    this.socket.on('disconnect', function() {
      setTimeout(function() {
        me.connect(cb);
      }, 2000);

      console.log('disconnect');
    });
  }

};

let sc = new SocketClient({
  host: '10.0.15.179',
  post: 3000
});

sc.connect();

module.exports = SocketClient;
