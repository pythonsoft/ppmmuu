const manuscriptService = require('../api/manuscript/service');
const config = require('../config');

const rsmq = config.rsmq;

const receiveMessage = function receiveMessage(){
  rsmq.receiveMessage({ qname: config.umpAssistQueueName }, (err, resp) => {
    if (resp && resp.id) {
      rsmq.deleteMessage({qname: config.umpAssistQueueName, id: resp.id}, function (err, resp) {
        if (resp===1) {
          console.log("Message deleted.")
        }
      });
      console.log('Message received.', resp);
    }
  });
}

setInterval(receiveMessage, 1000);
