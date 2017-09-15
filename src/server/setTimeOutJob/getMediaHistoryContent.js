'use strict';

const WatchingHistoryInfo = require('../api/user/watchingHistoryInfo');
const mediaService = require('../api/media/service');

const watchingHistoryInfo = new WatchingHistoryInfo();

const renewHistoryList = function() {
  watchingHistoryInfo.collection.findOneAndUpdate(
    { status: WatchingHistoryInfo.STATUS.UNAVAILABLE },
    { $set: { status: WatchingHistoryInfo.STATUS.PROCESSING } },
    {
      projection: { videoId: 1, status: 1 },
      returnOriginal: false,
    }, (err, r) => {
      if (err || !r.value) {
        return false;
      }
      const query = {
        q: '',
        fl: 'id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify,f_str_03',
        sort: 'last_modify desc',
        start: 0,
        rows: 1,
        hl: 'off',
      };
      mediaService.solrSearch(query, (err, doc) => {
        if (err) {
          watchingHistoryInfo.collection.findOneAndUpdate(
            { _id: r.value._id },
            { $set: { status: 'unavailable' } },
            {
              returnOriginal: false,
            }, (err, r) => {
              console.log('1 err, r', err, r);
            });
        } else {
          watchingHistoryInfo.collection.findOneAndUpdate(
            { _id: r.value._id },
            {
              $set: {
                status: WatchingHistoryInfo.STATUS.AVAILABLE,
                videoContent: doc.docs[0],
                updatedTime: new Date()
              }
            },
            {
              returnOriginal: false,
            }, (err, r) => {
              console.log('1 err, r', err, r);
            });
        }
      }, null, r.value.videoId);
    });
}

setTimeout(renewHistoryList, 1000 * 10);
