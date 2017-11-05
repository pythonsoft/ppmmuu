/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('./config');
const globalConfig = require('../../config');
const utils = require('../../common/utils');
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

const VersionInfo = require('./versionInfo');

const versionInfo = new VersionInfo();

const service = {};

const unzipPackage = function unzipPackage(id, zipPath, targetDirPath, cb) {
  if (!fs.existsSync(targetDirPath)) {
    fs.mkdirSync(targetDirPath);
  }

  exec(`unzip ${zipPath} -d ${targetDirPath}`, (error, stdout, stderr) => {
    if (error) {
      service.update(id, VersionInfo.STATUS.ERROR, err.message, false, () => cb && cb(error.message));
      return false;
    }
    service.update(id, VersionInfo.STATUS.UNZIP, 'unzip package success', targetDirPath, cb);
  });

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
  if (fs.existsSync(configPath)) {

    fs.readFile(configPath, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(err.message);
      }

      const obj = JSON.parse(data);

      versionInfo.collection.updateOne({ _id: id }, {
        $set: {
          version: obj.version,
          updateList: obj.updateList,
        },
      }, (err, r) => {
        if (err) {
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
  exec('pm2 reload all', (error, stdout, stderr) => {
    if (error) {
      return cb && cb(error);
    }

    if (stderr) {
      return cb && cb(stderr);
    }

    service.update(id, VersionInfo.STATUS.SUCCESS, 'upgrade success.', false, cb);
  });
};

service.upload = function (info, creatorId, creatorName, cb) {
  if (!info._id) {
    info._id = uuid.v1();
  }
  const t = new Date();
  info.createdTime = t;
  info.modifyTime = t;
  info.creator = { _id: creatorId, name: creatorName };

  versionInfo.insertOne(info, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    const zipPath = info.packagePath;
    const targetDirPath = path.join(config.uploadPackageTempPath, info._id);

    unzipPackage(info._id, zipPath, targetDirPath, (err, r) => {
      if(err) {
        return cb && cb(err);
      }

      return cb && cb(null, info);
    });

    return false;
  });
};

service.install = function install(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'id is null.' }));
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    if (!doc) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: 'doc is null.' }));
    }

    fs.readdir(doc.extractPath, (err, files) => {
      if (err) {
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }

      const loop = function (index) {
        if (!files[index]) {
          service.update(id, VersionInfo.STATUS.TRANSFER, 'transfer completely', false, (err) => {
            if (err) {
              return cb && cb(err);
            }

            restartServer(id, cb);
          });
          return false;
        }

        const targetPath = globalConfig.upgradeSystem[files[index]];

        if (targetPath) {
          copyFile(`${path.join(doc.extractPath, files[index])}/`, targetPath, (err) => {
            if (err) {
              service.update(id, VersionInfo.STATUS.ERROR, err, false, () => cb && cb(err));
            }

            loop(index + 1);
          });
        } else if (files[index] === 'version.json') {
          readConfigJSON(id, path.join(doc.extractPath, files[index]), (err) => {
            if (err) {
              return cb && cb(err);
            }
            loop(index + 1);
          });
        }else {
          loop(index + 1);
        }
      };

      loop(0);
    });
  });
};

service.update = function (id, status, log, extractPath, cb) {
  const updateInfo = {};

  if (status) {
    updateInfo.status = status;
  }

  if (extractPath) {
    updateInfo.extractPath = extractPath;
  }

  if (utils.isEmptyObject(updateInfo)) {
    return cb && cb(null, 'ok');
  }

  const update = {
    $set: updateInfo
  };

  if (log) {
    update['$addToSet'] = { logs: log };
  }

  versionInfo.collection.updateOne({ _id: id }, update, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    return cb && cb(null, rs);
  });

};

service.list = function (id, pathName, cb) {
  if (!id) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'id is null.' }));
  }

  if (pathName.constructor !== String) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'path name is not string.' }));
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    if (!doc) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: 'doc is null.' }));
    }

    const t = path.join(doc.extractPath, pathName);

    fs.readdir(t, (err, files) => {
      if (err) {
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }

      return cb && cb(null, files);
    });
  });
};

service.readFile = function readFile(id, filePath, cb) {
  if (!id) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'id is null' }));
  }

  if (!filePath || filePath.constructor !== String) {
    return cb && cb(i18n.t('databaseErrorDetail', { error: 'file path is null or not string' }));
  }

  versionInfo.collection.findOne({ _id: id }, { fields: { extractPath: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    if (!doc) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: 'version info is null' }));
    }

    const t = path.join(doc.extractPath, filePath);

    fs.readFile(t, { encoding: 'utf8' }, (err, data) => {
      if(err) {
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }

      return cb && cb(null, data);
    });
  });
};

service.getDetail = function getDetail(id, cb) {
  const query = {};
  const options = {};

  if (!id) {
    query.status = VersionInfo.STATUS.SUCCESS;
    options.sort = [[ 'modifyTime', -1 ]];
  }else {
    query._id = id;
  }

  versionInfo.collection.findOne(query, options, (err, doc) => {
    if(err) {
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }

    return cb && cb(null, doc);
  });

};

module.exports = service;
