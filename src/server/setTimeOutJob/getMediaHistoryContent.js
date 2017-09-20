'use strict';

const WatchingHistoryInfo = require('../api/user/watchingHistoryInfo');
const mediaService = require('../api/media/service');
const logger = require('../common/log')('error');

const watchingHistoryInfo = new WatchingHistoryInfo();

const renewHistoryList = function renewHistoryList() {
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
            { $set: { status: WatchingHistoryInfo.STATUS.UNAVAILABLE } },
            {
              returnOriginal: false,
            }, (err) => {
              if (err) {
                logger.error(err);
              }
            });
        } else {
          watchingHistoryInfo.collection.findOneAndUpdate(
            { _id: r.value._id },
            {
              $set: {
                status: WatchingHistoryInfo.STATUS.AVAILABLE,
                videoContent: doc.docs[0],
                updatedTime: new Date(),
              },
            },
            {
              returnOriginal: false,
            }, (err) => {
              if (err) {
                logger.error(err);
              }
            });
        }
      }, null, r.value.videoId);
    });
};

setInterval(renewHistoryList, 1000 * 6);
