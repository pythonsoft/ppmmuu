/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('./config');
const globalConfig = require('../../config');
const utils = require('../../common/utils');
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const result = require('../../common/result');
const uuid = require('uuid');
const path = require('path');
const unzip = require('unzip');
const fs = require('fs');
const exec = require('child_process').exec;

const VersionInfo = require('./versionInfo');
const versionInfo = new VersionInfo();

const service = {};

const unzipPackage = function unzipPackage(id, zipPath, targetDirPath, cb) {
  if(!fs.existsSync(targetDirPath)) {
    fs.mkdirSync(targetDirPath);
  }

  const readStream = fs.createReadStream(zipPath);
  const unzipExtractor = unzip.Extract({ path: targetDirPath });

  unzipExtractor.on('error', function(err) {
    logger.error(err.message);

    service.update(id, VersionInfo.STATUS.ERROR, err.message, false, () => {
      return cb && cb(err.message);
    });
  });

  unzipExtractor.on('close', () => {
    service.update(id, VersionInfo.STATUS.UNZIP, 'unzip package success', targetDirPath, cb);
    return false;
  });

  readStream.pipe(unzipExtractor);
};

const copyFile = function copyFile(originPath, targetPath, cb) {
  exec(`cp -rf ${originPath} ${targetPath}`, (error, stdout, stderr) => {
    if (error) {
      return cb && cb(error);
    }

    return cb && cb(stderr, stdout);
  });
};

const readConfigJSON = function readConfigJSON(id, configPath, cb) {
  if(fs.existsSync(configPath)) {
    fs.readFile(configPath, { encoding: 'utf8' }, (err, data) => {
      if(err) {
        logger.error(err.message);
        return cb && cb(err.message);
      }

      const obj = JSON.parse(data);

      versionInfo.collection.updateOne({ _id: id }, {
        $set: {
          version: obj.version,
          updateList: obj.updateList
        }
      }, (err, r) => {
        if(err) {
          logger.error(err.message);
          return cb && cb(err.message);
        }

        return cb && cb(null, r);
      });
    });
  } else {
    return cb && cb(null, 'ok');
  }
};

const restartServer = function restartServer(id, cb) {
  exec(`pm2 reload all`, (error, stdout, stderr) => {
    if (error) {
      return cb && cb(error);
    }

    if(stderr) {
      return cb && cb(stderr);
    }

    service.update(id, VersionInfo.STATUS.SUCCESS, 'upgrade success.', false, cb);
  });
};

service.upload = function (info, creatorId, creatorName, cb) {
  if(!info._id) {
    info._id = uuid.v1();
  }
  const t = new Date();
  info.createdTime = t;
  info.modifyTime = t;
  info.creator = { _id: creatorId, name: creatorName };

  console.log('help -->', info);

  versionInfo.insertOne(info, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    const zipPath = info.packagePath;
    const targetDirPath = path.join(config.uploadPackageTempPath, info._id);

    unzipPackage(info._id, zipPath, targetDirPath, (err, r) => {
      return cb && cb(err, r);
    });

    return false;
  });
};

service.install = function install(id, cb) {
  if(!id) {
    //todo
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'id is null.' }));
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    if(!doc) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: 'doc is null.' }));
    }

    fs.readdir(doc.extractPath, (err, files) => {
      if(err) {
        //todo
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }

      const loop = function(index) {
        if(files[index]) {
          service.update(id, VersionInfo.STATUS.TRANSFER, 'transfer completely', false, err => {
            if(err) {
              return cb && cb(err);
            }

            restartServer(id, cb);
          });
          return false;
        }

        const targetPath = globalConfig.upgradeSystem[files[index]];

        if(targetPath) {
          copyFile(path.join(doc.extractPath, files[index]) + '/', targetPath, err => {
            if(err) {
              service.update(id, VersionInfo.STATUS.ERROR, err, false, () => {
                return cb && cb(err);
              });
            }

            loop(index + 1);
          });
        }else if(files[index] === 'config.json') {
          readConfigJSON(id, path.join(doc.extractPath, files[index]), err => {
            if(err) {
              return cb && cb(err);
            }
            loop(index + 1);
          });
        }
      };

      loop(0);
    });
  });
};

service.update = function (id, status, description, extractPath, cb) {
  const updateInfo = {};
  if(status) {
    updateInfo.status = status;
  }

  if(description) {
    updateInfo.description = description;
  }

  if(extractPath) {
    updateInfo.extractPath = extractPath;
  }

  if(utils.isEmptyObject(updateInfo)) {
    return cb && cb(null, 'ok');
  }

  versionInfo.updateOne({ _id: id }, updateInfo, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    return cb && cb(null, rs);
  });
};

service.list = function (id, pathName, cb) {
  if(!id) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'id is null.' }));
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    if(!doc) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: 'doc is null.' }));
    }

    fs.readdir(path.join(doc.extractPath, pathName), (err, files) => {
      if(err) {
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }

      return cb && cb(null, files);
    });

  });
};

service.readFile = function readFile(id, filePath, res) {
  if(!id) {
    return res.end('id is null.' );
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return res.end('err.message');
    }

    if(!doc) {
      return res.end('version info is null.' );
    }

    fs.createReadStream(path.join(doc.extractPath, filePath)).pipe(res);
  });
};

module.exports = service;
