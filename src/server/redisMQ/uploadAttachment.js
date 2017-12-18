const manuscriptService = require('../api/manuscript/service');
const config = require('../config');
const RedisMQ = require('rsmq');

const rsmq = new RedisMQ({ host: config.redis_host, port: config.redis_port, options: config.redis_opts, ns: 'rsmq' });

rsmq.receiveMessage({ qname: config.umpAssistQueueName }, (err, resp) => {
  if (resp) {
    console.log('Message received.', resp);
  } else {
    console.log('No messages for me...');
  }
});
