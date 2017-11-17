/**
 * Created by chaoningxie on 2016/12/10.
 */
const fs = require('fs');
const path = require('path');
const socketStream = require('socket.io-stream');
const crypto = require('crypto');
const utils = require('../../common/utils');
const loginMiddleware = require('../../middleware/login');
const helper = require('../chat/helper');

const config = require('../../config');
const KEY = config.KEY;

const STORAGE_PATH = config.uploadPath;

let isStorageExist = fs.existsSync(STORAGE_PATH);

if(!isStorageExist) {
  utils.console('storage dir created');
  fs.mkdirSync(STORAGE_PATH);
}

let STATUS = {
  ready: 1,
  start: 2,
  transfer: 3,
  transferSuccess: 4,
  composeStart: 5,
  compose: 6,
  composeSuccess: 7,
  composeError: 8,
  removePackagePartStart: 9,
  removePackagePart: 10,
  removePackageSuccess: 11,
  removePackageError: 12,
  success: 999,
  error: 1000
};

let socketIds = {};
let tasks = {};

let isGetAllPackage = function(taskId) {
  let flag = true;
  let task = tasks[taskId];
  if(!task) {
    throw new Error('task is not exist.');
  }

  let order = task.data.order;
  let acceptPackagePart = task.acceptPackagePart;

  for(let i = 0, len = order.length; i < len; i++) {
    if(!acceptPackagePart[order[i]]) {
      flag = false;
      break;
    }
  }

  return flag;
};

let composeFile = function(taskId, successFn) {
  let task = tasks[taskId];
  if(!task) {
    throw new Error('task is not exist.');
  }

  let order = task.data.order;
  let name = task.data.name.replace(/[\\\/:*?"<>|”]/img, '_');
  let filePath = path.join(STORAGE_PATH, taskId, name);
  let len = order.length;

  updateStatus(taskId, STATUS.composeStart);

  let writeFile = function(index, start) {
    let packagePartId = order[index];
    let packageInfo = task.acceptPackagePart[packagePartId];
    let ws = fs.createWriteStream(filePath, { start: start, flags: start > 0 ? 'r+' : 'w', encoding: 'binary' });
    let fp = path.join(STORAGE_PATH, taskId, packagePartId);
    let rs = fs.createReadStream(fp);

    ws.on('error', function(err) {
      utils.console('write file to storage fail', err);
      updateStatus(taskId, STATUS.composeError, err);
    });

    ws.on('finish', function() {
      if(index < len - 1) {
        updateStatus(taskId, STATUS.compose);
        writeFile(index + 1, start + packageInfo.size);
      }else {
        task.filePath = filePath;
        tasks[taskId] = Object.assign({}, task);
        updateStatus(taskId, STATUS.composeSuccess);
        utils.console('compose file success');
        successFn && successFn();
      }
    });

    rs.pipe(ws);
  };

  writeFile(0, 0);
};

let removePackageParts = function(taskId, callback) {
  let task = tasks[taskId];
  if(!task) {
    throw new Error('task is not exist.');
  }

  let order = task.data.order;
  let del = function(index) {
    let partId = order[index];

    if(!partId) {
      utils.console('remove package parts success');
      updateStatus(taskId, STATUS.removePackageSuccess);
      callback && callback()
      return false;
    }

    let fp = path.join(STORAGE_PATH, taskId, partId);
    if(fs.existsSync(fp)) {
      updateStatus(taskId, STATUS.removePackagePart);
      fs.unlinkSync(fp);
    }

    del(index + 1);
  };

  updateStatus(taskId, STATUS.removePackagePartStart);
  del(0);
};

let invalidRequest = function(socket, message) {
  socket.emit('invalid_request', message);
  socket.disconnect();
};

let updateStatus = function(taskId, status, errorMessage) {
  if(!taskId) { return false; }
  let task = tasks[taskId];
  if(task) {
    tasks[taskId].status = status;
    if(status === STATUS.error || status === STATUS.composeError || status === STATUS.removePackageError) {
      tasks[taskId].error = errorMessage.message ? errorMessage.message : errorMessage.toString();
    }
  }
}

class FileIO {
  constructor(io) {
    let fileIO = io.of('/file');

    /// authorize
    fileIO.use(function(socket, next) {
      let rs = loginMiddleware.webSocketMiddleware(socket);

      if (rs.status === '0') {
        const data = rs.data;
        socket.info = data.info;

        socketIds[data.socketId] = socket.info;
        next();
      } else {
        socket.emit('error', rs);
        socket.disconnect();
      }

    });

    fileIO.on('connection', function (socket) {
      utils.console('file connection', socket.id);

      let passedLength = 0;
      let headerInfo = {};
      let isConnect = true;

      const showProcess = function() {
        let taskData = headerInfo.data;
        let totalSize = taskData.size;
        let lastSize = 0;
        let startTime = Date.now();
        let interval = 5000;

        let show = function() {
          let percent = Math.ceil((passedLength / totalSize) * 100);
          let averageSpeed = (passedLength - lastSize) / interval * 1000;

          if(percent > 100) {
            percent = 100;
          }

          lastSize = passedLength;
          utils.processWrite('任务('+ taskData.name +' - '+ taskData._id +')已接收' + utils.formatSize(passedLength) + ', ' + percent + '%, 平均速度：' + utils.formatSize(averageSpeed) + '/s');

          if(passedLength >= totalSize) {
            console.log('共用时：' + (Date.now() - startTime) / 1000 + '秒');
          }else {
            if(!isConnect) {
              utils.processWrite('---- disconnect ----');
              return false;
            }
            setTimeout(function() {
              show();
            }, interval);
          }
        };

        show();
      };

      socket.on('headerPackage', function (data) {
        if(tasks[data._id]) {
          invalidRequest(socket, 'ignore task which exist.');
          return false;
        }

        if(!data.name) {
          invalidRequest(socket, 'this package name is null.');
          return false;
        }

        utils.console('accept header package', data);

        let o = {
          data: data,
          targetDir: path.join(STORAGE_PATH, data._id),
          status: STATUS.start,
          acceptPackagePart: {},
          filePath: '',
          error: '',
          socketId: socket.id
        };

        socketIds[socket.id]._id = data._id;

        utils.console('socket id map', socketIds[socket.id]);

        fs.mkdirSync(path.join(o.targetDir));

        tasks[data._id] = Object.assign({}, o);
        headerInfo = Object.assign({}, o);

        socket.emit('transfer_start');
        showProcess();
      });

      socket.on('error', function(err) {
        utils.console('socket error socket id: '+ socket.id, err);
        socket.disconnect();
        updateStatus(socketIds[socket.id]._id, STATUS.error, err);
      });

      socket.on('disconnect', function() {
        isConnect = false;
        utils.console('disconnect with client :' + socket.id);
      });

      socketStream(socket).on('fileStream', function(stream, data) {
        let task = tasks[data.pid];
        if(!task) {
          invalidRequest(socket, 'file stream accept data invalid.');
        }

        let filename = path.join(task.targetDir, data._id);
        let writeStream = fs.createWriteStream(filename);
        updateStatus(data.pid, STATUS.transfer);

        writeStream.on('finish', function() {
          if(data.status === STATUS.error) {
            fs.unlinkSync(filename);
            updateStatus(data.pid, STATUS.error, data.error);
            socket.emit('transfer_package_error', data);
          }else {
            tasks[data.pid]['acceptPackagePart'][data._id] = data;
            socket.emit('transfer_package_success', data);
          }

          socket.emit('transfer_package_finish', data);

          if(isGetAllPackage(data.pid)) {
            //get all package and compose file
            updateStatus(data.pid, STATUS.success);

            socket.emit('complete', '');
            socket.disconnect();

            utils.console('compose file');
            composeFile(data.pid, function() {
              removePackageParts(data.pid, function() {
                updateStatus(data.pid, STATUS.success);
              });
            });
          }
        });

        writeStream.on('error', function(err) {
          data.status = STATUS.error;
          data.error = err;
        });

        stream.on('data', function(chunk) {
          passedLength += chunk.length;
        });

        if(socketIds[socket.id].secret) {
          const decipher = crypto.createDecipher('aes192', KEY);
          stream.pipe(decipher).pipe(writeStream);
        }else {
          stream.pipe(writeStream);
        }

      });

    });
  }
};

module.exports = FileIO;

