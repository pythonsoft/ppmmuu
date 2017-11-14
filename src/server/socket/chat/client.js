/**
 * Created by chaoningxie on 2017/2/9.
 */
const clientConnect = require('socket.io-client');
const utils = require('../../common/utils');

class ChatClient {
  constructor(options) {
    this.settings = Object.assign({
      host: 'localhost',
      port: 8090,
      key: 'BRYSJHHRHLYQQLMGSYCL',
      userId: 'chaoningx@163.com',
      isCrypto: true
    }, options);

    this.socket = null;
  }

  connect() {
    let me = this;
    const socket = clientConnect('http://' + me.settings.host + ':' + me.settings.port + '/chat', {
      extraHeaders: {
        'x-custom-header-for-authorize': utils.cipher(me.settings.userId + '-' + (me.settings.isCrypto ? 1 : 0), me.settings.key)
      }
    });

    this.socket = socket;

    socket.on('connect', function() {
      utils.console('socket connect', socket.id);
    });

    socket.on('error', function(err) {
      utils.console('error', err);
    });

    socket.on('disconnect', function(msg) {
      utils.console('disconnect with server', msg);
    });

    socket.on('chat', function(msg) {
      utils.console('chat receive', msg)
    });

    socket.on('joinRoomResult', function(rs) {
      utils.console('joinRoomResult', rs);
    });
  }

  sendMessage(to, message) {
    let me = this;
    this.socket.emit('chat', {
      from: this.settings.userId,
      to: to,
      content: message,
      _id: me.socket.id + '_' + new Date().getTime()
    });
  }

  join(roomId) {
    this.socket.emit('joinRoom', roomId);
  }

};

// let chatClient = new ChatClient({
//   userId: 'chaoningx@163.com'
// });
// chatClient.connect();
// chatClient.join('chaoningx');

let g = new ChatClient({
  userId: 'chaoningx@gmail.com'
});
g.connect();
g.join('chaoningx');

setTimeout(function() {
  console.log('send message b');
  g.sendMessage('chaoningx', 'hello, my name is ' + g.settings.userId);
}, 5000);

