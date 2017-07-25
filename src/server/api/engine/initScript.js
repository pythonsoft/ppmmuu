'use strict';

const EngineGroupInfo = require('./engineGroupInfo');
const service = require('./service');
const i18n = require('i18next');

const engineGroupInfo = new EngineGroupInfo();

const init = function init() {
  const info = {
    parentId: '',
    name: i18n.t('systemEngineGroupName').message,
    creator: {
      _id: 'engine-root',
      name: '@system',
    },
  };

  engineGroupInfo.collection.findOne({ 'creator._id': info.creator._id }, { fields: { _id: 1 } }, (err, doc) => {
    if (err) {
      console.log('init engine root group info fail. error message:', err.message);
      return;
    }

    if (doc) {
      console.log('engine root group info has been create!');
      return false;
    }

    service.addGroup(info, (err) => {
      if (err) {
        console.log('add engine root group info fail. error message:', err.message);
        return;
      }

      console.log('engine root group info has been create!');
    });
  });
};

setTimeout(() => {
  init();
}, 5000);

