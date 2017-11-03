const i18n = require('i18next');

const service = require('./service');
const FileInfo = require('./fileInfo');
const CatalogInfo = require('./catalogInfo');

const getKeyByValue = function getKeyByValue(t, value) {
  let rs = '';

  for(let k in t) {
    if(k[t] === value) {
      rs = k;
      break;
    }
  }

  return rs;
};

const xml = {};

xml.create = function create(objectId, cb) {
  if(!objectId) {
    return cb && cb(i18n.t('libraryObjectIdIsNull'));
  }

  service.getCatalogByObjectId(objectId, { name: 1, description: 1 }, (err, task) => {
    if(err) {
      return cb && cb(err);
    }

    service.listCatalog(objectId, (err, catalogs) => {
      if(err) {
        return cb && cb(err);
      }

      service.listFile(objectId, (err, files) => {
        if(err) {
          return cb && cb(err);
        }

        const fileList = [];
        const catalogInfo = [];
        let file = null;
        let catalog = null;

        for(let i = 0, len = files.length; i < len; i++) {
          file = files[i];
          fileList.push([
            '<file>',
              '<id>'+ file._id +'</id>',
              '<name>'+ file.name +'</name>',
              '<size>'+ file.size +'</size>',
              '<realPath>'+ file.realPath +'</realPath>',
              '<path>'+ file.path +'</path>',
              '<type>'+ getKeyByValue(FileInfo.TYPE, file.type) +'</type>',
              '<available>'+ getKeyByValue(FileInfo.AVAILABLE, file.available) +'</available>',
              '<status>'+ getKeyByValue(FileInfo.STATUS, file.status) +'</status>',
              '<archivePath>'+ file.archivePath +'</archivePath>',
              '<description>'+ file.description +'</description>',
            '</file>',
          ].join(''));
        };

        for(let j = 0, l = catalogs.length; j < l; j++) {
          catalog = catalogs[j];
          fileList.push([
            '<catalogInfo>',
              '<id>'+ catalog._id +'</id>',
              '<fileId>'+ catalog.fileInfo._id +'</fileId>',
              '<englishName>'+ catalog.englishName +'</englishName>',
              '<chineseName>'+ catalog.chineseName +'</chineseName>',
              '<parentId>'+ catalog.parentId +'</parentId>',
              '<keyword>'+ catalog.keyword +'</keyword>',
              '<content>'+ catalog.content +'</content>',
              '<source>'+ catalog.source +'</source>',
              '<version>'+ catalog.version +'</version>',
              '<duration>'+ catalog.duration +'</duration>',
              '<keyman>'+ catalog.keyman +'</keyman>',
              '<language>'+ catalog.language +'</language>',
              '<root>'+ catalog.root +'</root>',
              '<type>'+ catalog.englishName +'</type>',
              '<inpoint>'+ catalog.inpoint +'</inpoint>',
              '<outpoint>'+ catalog.outpoint +'</outpoint>',
              '<available>'+ getKeyByValue(CatalogInfo.AVAILABLE, catalog.available) +'</available>',
              '<materialDate>'+ catalog.materialDate +'</materialDate>',
            '</catalogInfo>',
          ].join(''));
        };

        const template = [
          '<archive_main>',
            '<objectId>'+ objectId +'</objectId>',
            '<name>'+ task.name +'</name>',
            '<description>'+ task.description +'</description>',
            '<fileList>'+ fileList.join('') +'</fileList>',
            '<catalogInfoList>'+ catalogInfo.join('') +'</catalogInfoList>',
          '</archive_main>',
        ];

        return cb && cb(null, template.join(''));
      });
    });

  });

};

module.exports = xml;
