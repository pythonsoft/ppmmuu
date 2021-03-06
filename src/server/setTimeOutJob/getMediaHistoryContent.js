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
      const options = {
        source: mediaService.ES_FILTER_FIELDS,
        isAccurate: true,
        match: [{ key: '_id', value: r.value.videoId }],
        start: 0,
        pageSize: 1,
      };
      mediaService.esSearch(options, (err, doc) => {
        if (err || !doc.docs[0]) {
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
      });
    });
};

setInterval(renewHistoryList, 1000 * 6);
