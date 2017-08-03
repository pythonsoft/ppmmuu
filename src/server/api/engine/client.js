/**
 * Created by chaoningxie on 2016/12/10.
 */

'use strict';

const clientConnect = require('socket.io-client');

class SocketClient {
  constructor(options) {
    this.settings = Object.assign({
      host: '10.0.15.179',
      port: 3000,
      protocol: 'http',
      path: '/',
    }, options);

    this.socket = null;
  }

  connect(cb) {
    const me = this;

    const url = `${this.settings.protocol}://${me.settings.host}:${me.settings.port}${me.settings.path}`;

    console.log(`正在连接服务器, ${url}`);

    this.socket = clientConnect(url);

    this.socket.on('connect', () => {
      this.socket.emit('setClientInfo', { name: 'web' });
      console.log('server connected');
      return cb && cb();
    });

    this.socket.on('error', (err) => {
      console.log(err);
    });

    this.socket.on('disconnect', () => {
      setTimeout(() => {
        me.connect(cb);
      }, 2000);

      console.log('disconnect');
    });
  }

}

module.exports = SocketClient;
