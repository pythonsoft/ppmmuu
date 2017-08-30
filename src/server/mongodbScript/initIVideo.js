
'use strict';

const service = require('../api/ivideo/service');

const userId = 'bea711c0-67ae-11e7-8b13-c506d97b38b0';

const init = function() {
  service.ensureAccountInit(userId, (err, doc, isNew) => {
    if(err) {
      console.log('ensure -->', err);
      return false;
    }

    if(!isNew) {
      return false;
    }

    const id = doc._id;

    service.createDirectory(userId, '目录1', id, {}, (err, r, dirId) => {
      if(err) {
        console.log('createDirectory -->', err);
        return false;
      }

      service.createDirectory(userId, '目录1-1', dirId, {}, (err, r, dirId) => {
        if(err) {
          console.log('createDirectory -->', err);
          return false;
        }
      });

      service.createDirectory(userId, '目录1-2', dirId, {}, (err, r, dirId) => {
        if(err) {
          console.log('createDirectory -->', err);
          return false;
        }
      });
    });
  });
};

service.getMyResource(userId, (err, doc) => {
  if(err) {
    console.log('ensure -->', err);
    return false;
  }

  if(!doc) {
    init();
  }

  console.log('init ivideo data completely.');
});





