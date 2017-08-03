/**
 * Created by chaoningxie on 2016/12/10.
 */

'use strict';

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
    this.clientName = 'web';
  }

  connect(cb) {
    const me = this;

    const url = `${this.settings.protocol}://${me.settings.host}:${me.settings.port}${me.settings.path}`;

    console.log(`正在连接服务器, ${url}`);

    this.socket = clientConnect(url);

    this.socket.on('connect', () => {
      console.log('server connected');
      me.socket.emit('setClientInfo', { name: me.clientName });
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

    this.socket.on('sendSysInfo', function(sysInfo) {
      console.log('sysInfo ---->', sysInfo);
    })
  }

  listProcess() {
    const me = this;
    this.socket.emit('action', { name: '10.0.15.179-imacarcher', action: 'getActions', process: 'npm' }, (err) => {
      debug('err, emitting action', err);
    });
  }

}

module.exports = SocketClient;
