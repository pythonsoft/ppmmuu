'use strict';

const manuscriptService = require('../api/manuscript/extService');
const config = require('../config');

const rsmq = config.rsmq;

const receiveMessage = function receiveMessage() {
  rsmq.popMessage({ qname: config.umpAssistQueueName }, (err, resp) => {
    if (resp && resp.id) {
      console.log('Message received.');
      try {
        const info = JSON.parse(resp.message);
        manuscriptService.dealAttachment(info);
      } catch (e) {

      }
    }
  });
};

setInterval(receiveMessage, 10);
