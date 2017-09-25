/**
 * Created by steven on 2017/9/25.
 */

'use strict';

const CatalogTaskInfo = require('../api/library/catalogTaskInfo');
const CatalogInfo = require('../api/library/catalogInfo');
const UserInfo = require('../api/user/userInfo');
const FileInfo = require('../api/library/fileInfo');
const service = require('../api/library/service');
const uuid = require('uuid');

const catalogTaskInfo = new CatalogTaskInfo();
const catalogInfo = new CatalogInfo();
const userInfo = new UserInfo();
const fileInfo = new FileInfo();

let objectId = '7B5AE857-733F-5790-4459-53DE094FDBB6';
const objectIds = [];
for(let i =0, len = 20; i < len; i++){
  objectIds.push(uuid.v1());
}

const catalogtaskinfo = {
  name: 'test',
  objectId,
};

catalogTaskInfo.collection.findOne({ objectId }, (err, doc) => {
  if (err) {
    console.log('error==>', err.message);
    return;
  }
  if (doc) {
    return;
  }
  userInfo.collection.findOne({ email: 'xuyawen@phoenixtv.com' }, (err, doc) => {
    if (err) {
      console.log('error:', err.message);
      return;
    }
    const ownerId = doc ? doc._id : '';
    const ownerName = doc ? doc.name : '';
    const departmentId = doc ? doc.department._id : '';
    const departmentName = doc ? doc.department.name : '';
    for(let i = 0, len = objectIds.length; i < len; i++) {
      objectId = objectIds[i];
      catalogtaskinfo.objectId = objectId;
      catalogtaskinfo._id = uuid.v1();
      service.createCatalogTask(catalogtaskinfo, ownerId, ownerName, departmentId, departmentName, (err) => {
        if (err) {
          console.log('error:', err.message);
          return;
        }
        const file = {
          _id: uuid.v1(),
          objectId,
          name: 'file1',
          size: 1024 * 1024 * 30,
          realPath: '/user/local',
          path: '/local',
          type: '0',
          available: '1',
          status: '1',
          description: '',
          archivePath: '',
          createdTime: new Date(),
          lastModifyTime: new Date(),
          details: {},
        };
        const fileinfos = [];
        for (let key in FileInfo.TYPE) {
          for (let key1 in FileInfo.STATUS) {
            const newFile = Object.assign({}, file);
            newFile.type = FileInfo.TYPE[key];
            newFile.status = FileInfo.STATUS[key1];
            newFile._id = uuid.v1();
            fileinfos.push(newFile);
          }
        }
        fileInfo.collection.insert(fileinfos, (err) => {
          if (err) {
            console.log('error==>', err.message);
          }
          fileInfo.collection.find({objectId}).toArray((err, docs) => {
            if (err) {
              console.log('error===>', err.message);
            }
            const info = {
              _id: uuid.v1(),
              objectId,
              fileId: docs[0]._id,
              englishName: 'testtt1',
              chineseName: '测试1',
              keyword: 'gggg',
              content: '这是一个测试1',
              source: '',
              version: '1.0.0',
              keyman: '鲁豫',
              language: 'putonghua',
              root: '',
              type: '素材',
              inpoint: 0,
              outpoint: 1000,
              available: '0',
              materialDate: {
                form: '2017-03-21',
                to: '2017-03-25',
              },
              owner: {
                _id: ownerId,
                name: ownerName,
              },
              department: {
                _id: departmentId,
                name: departmentName,
              },
              createdTime: new Date(),
              lastModifyTime: new Date(),
              details: {},
            };
        
            const infos = [];
            for (let i = 0, len = docs.length; i < len; i++) {
              const newInfo = JSON.parse(JSON.stringify(info));
              newInfo._id = uuid.v1();
              newInfo.fileId = docs[i]._id;
              infos.push(newInfo);
            }
        
            catalogInfo.collection.insert(infos, (err) => {
              if (err) {
                console.log(err.message);
              }
            });
          });
        });
      });
    }
  });
});
