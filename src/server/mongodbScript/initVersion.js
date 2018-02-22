/**
 * 将当前版本信息写入到UMP系统中
 */
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const service = require('../api/help/service');
const VersionInfo = require('../api/help/versionInfo');

const versionFilePath = path.join(__dirname, 'version.json');

const initVersion = function () {
  if (fs.existsSync(versionFilePath)) {
    const content = fs.readFileSync(versionFilePath);
    const json = JSON.parse(content);
    const t = new Date();
    const info = {
      _id: uuid.v1(),
      name: json.version,
      version: json.version,
      creator: { _id: 'initScript', name: 'initScript' },
      content: json.content || [],
      updateList: json.updateList || [],
      packagePath: 'initScript',
      status: VersionInfo.STATUS.SUCCESS,
      createdTime: t,
      modifyTime: t,
    };

    service.ensureVersionInfoByVersion(info.version, info, (err, r) => {
      if (err) {
        console.log('版本信息更新失败 --->', err);
        return false;
      }

      console.log('版本信息更新成功');
    });
  }
};

initVersion();

