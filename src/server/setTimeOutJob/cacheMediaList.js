'use strict';

const config = require('../config');
const logger = require('../common/log')('error');

const redisClient = config.redisClient;

const mediaService = require('../api/media/service');

(function cacheMediaList() {
  mediaService.getEsMediaList({ pageSize: 12 }, (err, r) => {
    if (r) {
      redisClient.set('cachedMediaList', JSON.stringify(r), (err) => {
        if (err) {
          logger.error(err);
        }
        setTimeout(cacheMediaList, 1000 * 60 * 3);
      });
    } else {
      setTimeout(cacheMediaList, 1000 * 60 * 3);
    }
  });
}());

