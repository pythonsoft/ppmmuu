/*
  <archive_main>
    <objectId>${objectId}</objectId>
    <name></name>
    <description></description>
    <fileList>
        <file>
            <serialNO></serialNO>
            <name></name>
            <size></size>
            <realPath></realPath>
            <path></path>
            <type></type>
            <available></available>
            <status></status>
            <archivePath></archivePath>
            <description></description>
        </file>
    </fileList>
    <catalogInfoList>
        <catalogInfo>
            <serialNO></serialNO>
            <englishName></englishName>
            <chineseName></chineseName>
            <parentId></parentId>
            <keyword></keyword>
            <content></content>
            <source></source>
            <version></version>
            <duration></duration>
            <keyman></keyman>
            <language></language>
            <root></root>
            <type></type>
            <inpoint></inpoint>
            <available></available>
            <materialDate></materialDate>
        </catalogInfo>
    </catalogInfoList>
  </archive_main>
*/
const service = require('./service');

const create = function(objectId) {
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

      });
    });

  });

};

module.exports = create();
