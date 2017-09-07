/**
 * Created by steven on 17/5/12.
 */

'use strict';

const fs = require('fs');
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const config = require('../../config');
const request = require('request');
const fieldConfig = require('./fieldConfig');
const ConfigurationInfo = require('../configuration/configurationInfo');

const HttpRequest = require('../../common/httpRequest');

const rq = new HttpRequest({
  hostname: config.HKAPI.hostname,
  port: config.HKAPI.port,
});

const configurationInfo = new ConfigurationInfo();
const service = {};

service.solrSearch = function solorSearch(info, cb) {
  if (!info.wt) {
    info.wt = 'json';
  }
  const struct = {
    wt: { type: 'string', validation(v) { v = v.trim().toLowerCase(); if (v !== 'json' && v !== 'xml') { return false; } return true; } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  info.wt = info.wt.trim().toLowerCase();

  const options = {
    uri: `${config.solrBaseUrl}program/select`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };
  const t1 = new Date().getTime();
  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      const rs = JSON.parse(response.body);
      let r = {};
      if (rs.response) {
        const highlighting = rs.highlighting || {};
        r.QTime = rs.responseHeader ? rs.responseHeader.QTime : (new Date().getTime() - t1);
        r = Object.assign(r, rs.response);
        if (!utils.isEmptyObject(highlighting)) {
          const docs = r.docs;
          for (let i = 0, len = docs.length; i < len; i++) {
            const doc = docs[i];
            const hl = highlighting[doc.id];
            if (!utils.isEmptyObject(hl)) {
              for (const key in hl) {
                doc[key] = hl[key].join('') || doc[key];
              }
            }
          }
        }
        return cb && cb(null, r);
      }
      return cb && cb(i18n.t('solrSearchError', { error: rs.error.msg }));
    } else if (error) {
      logger.error(error);
      return cb && cb(i18n.t('solrSearchError', { error }));
    }
    logger.error(response.body);
    return cb && cb(i18n.t('solrSearchFailed'));
  });
};

service.getMediaList = function getMediaList(info, cb) {
  const pageSize = info.pageSize || 4;
  const result = [];

  const loopGetCategoryList = function loopGetCategoryList(categories, index) {
    if (index >= categories.length) {
      return cb && cb(null, result);
    }
    const category = categories[index].label;
    const query = {
      q: `program_type:${category}`,
      fl: 'id,duration,name,ccid,program_type,program_name_cn,hd_flag,program_name_en,last_modify',
      sort: 'last_modify desc',
      start: 0,
      rows: pageSize,
    };
    service.solrSearch(query, (err, r) => {
      if (err) {
        return cb && cb(err);
      }
      result.push({ category, docs: r.docs });
      loopGetCategoryList(categories, index + 1);
    });
  };

  service.getSearchConfig((err, rs) => {
    if (err) {
      return cb && cb(i18n.t('databaseError'));
    }

    if (!rs.searchSelectConfigs.length) {
      return cb & cb(null, result);
    }

    const categories = rs.searchSelectConfigs[0].items;

    if (!categories.length) {
      return cb & cb(null, result);
    }

    loopGetCategoryList(categories, 0);
  });
};

service.getSearchConfig = function getSearchConfig(cb) {
  configurationInfo.collection.find({ key: { $in: ['meidaCenterSearchSelects', 'mediaCenterSearchRadios'] } }, { fields: { key: 1, value: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const rs = {
      searchSelectConfigs: [],
      searchRadioboxConfigs: [],
    };

    for (let i = 0, len = docs.length; i < len; i++) {
      if (docs[i].key === 'meidaCenterSearchSelects') {
        try {
          rs.searchSelectConfigs = JSON.parse(docs[i].value);
        } catch (e) {
          return cb && cb(i18n.t('getMeidaCenterSearchConfigsJSONError'));
        }
      } else {
        try {
          rs.searchRadioboxConfigs = JSON.parse(docs[i].value);
        } catch (e) {
          return cb && cb(i18n.t('getMeidaCenterSearchConfigsJSONError'));
        }
      }
    }

    return cb && cb(null, rs);
  });
};

service.getIcon = function getIcon(info, res) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };

  const err = utils.validation(info, struct);

  if (err) {
    res.end(err.message);
  }

  request.get(`${config.hongkongUrl}get_preview?objectid=${info.objectid}`).on('error', (error) => {
    logger.error(error);
    res.end(error.message);
  }).pipe(res);
};

service.getObject = function getObject(info, cb) {
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb(err.message);
  }

  const options = {
    uri: `${config.hongkongUrl}get_object`,
    method: 'GET',
    encoding: 'utf-8',
    qs: info,
  };

  request(options, (error, response) => {
    if (error) {
      logger.error(error);
      return cb(i18n.t('getObjectError', { error }));
    }

    if (response.statusCode !== 200) {
      logger.error(response.body);
      return cb(i18n.t('getObjectFailed'));
    }

    const rs = JSON.parse(response.body);
    rs.status = '0';

    if (rs.result.detail && rs.result.detail.program) {
      const program = rs.result.detail.program;
      const files = rs.result.files;

      for (const key in program) {
        if (program[key] === '' || program[key] === null) {
          delete program[key];
        } else {
          program[key] = { value: program[key], cn: fieldConfig[key] ? fieldConfig[key].cn : '' };
        }
      }

      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        for (const k in file) {
          if (file[k] === null || file[k] === '') {
            delete file[k];
          }
        }
      }
    }

    return cb(null, rs);
  });
};

// service.getVideo = function getVideo(req, res) {
//   const a = req.query.a || '1';
//   const path = a === '1' ? '/Users/steven/Downloads/youtube_encoding_long.mp4' : '/Users/steven/Downloads/25fps_transcoded_keyframe.mp4';
//   const stat = fs.statSync(path);
//   const total = stat.size;
//   if (req.headers.range) {
//     const range = req.headers.range;
//     const parts = range.replace(/bytes=/, '').split('-');
//     const partialstart = parts[0];
//     const partialend = parts[1];
//
//     const start = parseInt(partialstart, 10);
//     const end = partialend ? parseInt(partialend, 10) : total - 1;
//     const chunksize = (end - start) + 1;
//     console.log(`RANGE: ${start} - ${end} = ${chunksize}`);
//
//     const file = fs.createReadStream(path, { start, end });
//     res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${total}`, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
//     file.pipe(res);
//   } else {
//     console.log(`ALL: ${total}`);
//     res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
//     fs.createReadStream(path).pipe(res);
//   }
// };

service.getVideo = function getVideo(req, res) {
  const a = req.query.a || '1';
  const path = a === '1' ? '/Users/steven/Downloads/youtube_encoding_long.mp4' : '/Users/steven/Downloads/25fps_transcoded_keyframe.mp4';
  const stat = fs.statSync(path);
  const total = stat.size;
  console.log('total==>', total);
  const file = fs.createReadStream(path, { start: 0, end: 1200000 });
  file.pipe(res);
  // let data = '';
  // file.on("data", function (trunk){
  //   data += trunk;
  // });
  // file.on("end", function () {
  //   return res.json(result.json(null, data))
  // });
};

service.getStream = function getStream(objectId, res) {
  const struct = {
    objectId: { type: 'string', validation: 'require' },
  };

  const err = utils.validation({ objectId }, struct);

  if (err) {
    return res.end(JSON.stringify({ status: 1, data: {}, statusInfo: { code: 10000, message: err.message } }));
  }

  rq.get('/mamapi/get_stream', { objectid: objectId }, res);
};

// service.cutFile = function cutFile(filename, cb) {
//   const timestamps = new Date().getTime();
//   const path = `/Users/steven/Downloads/${filename}`;
//   const tempDir = config.uploadPath;
//   console.log(path);
//   ffmpeg(path)
//     .setStartTime('00:00:50')
//     .setDuration('100')
//     .output(`${tempDir + timestamps}.mp4`)
//     .on('end', (err) => {
//       if (!err) {
//         console.log('conversion Done');
//         return cb && cb(null, `${timestamps}.mp4`);
//       }
//     })
//     .on('error', (err) => {
//       console.log('error===> ', +err);
//       return cb && cb({ code: '-16001', message: err.message });
//     }).run();
// };
//
// service.mergeFile = function mergeFile(filenames, cb) {
//   filenames = filenames.split(',');
//   const tempDir = config.uploadPath;
//   const len = filenames.length;
//   const timestamps = new Date().getTime();
//   if (len <= 0) {
//     return cb && cb(null, null);
//   }
//   const command = ffmpeg(tempDir + filenames[0]);
//   for (let i = 1; i < len; i++) {
//     command.input(tempDir + filenames[1]);
//   }
//   command
//     .on('error', (err) => {
//       console.log(`An error occurred: ${err.message}`);
//       return cb && cb({ code: '-16002', message: err.message });
//     })
//     .on('end', () => {
//       console.log('Merging finished !');
//       return cb && cb(null, `${timestamps}.mp4`);
//     })
//     .mergeToFile(`${tempDir + timestamps}.mp4`, tempDir);
// };


module.exports = service;
