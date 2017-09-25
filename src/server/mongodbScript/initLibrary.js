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

const objectId = '7B5AE857-733F-5790-4459-53DE094FDBB3&t=1506304041671';

const catalogtaskinfo = {
  name: 'test',
  objectId: objectId,
}

catalogTaskInfo.collection.findOne({objectId: objectId}, function(err, doc) {
  if(err){
    console.log("error==>", err.message);
    return;
  }
  if(doc){
    return;
  }
  userInfo.collection.findOne({'email': 'xuyawen@phoenixtv.com'}, function (err, doc) {
    if (err) {
      console.log("error:", err.message);
      return;
    }
    const ownerId = doc ? doc._id : '';
    const ownerName = doc ? doc.name : '';
    const departmentId = doc ? doc.department._id : '';
    const departmentName = doc ? doc.department.name : '';
    service.createCatalogTask(catalogtaskinfo, ownerId, ownerName, departmentId, departmentName, function (err) {
      if (err) {
        console.log("error:", err.message);
        return;
      }
      const fileinfos = [
        {
          _id: uuid.v1(),
          objectId: objectId,
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
          details: {}
        },
        {
          _id: uuid.v1(),
          objectId: objectId,
          name: 'file2',
          size: 1024 * 1024 * 40,
          realPath: '/user/local/steven',
          path: '/local/steven',
          type: '1',
          available: '1',
          status: '1',
          description: '',
          archivePath: '',
          createdTime: new Date(),
          lastModifyTime: new Date(),
          details: {}
        },
        {
          _id: uuid.v1(),
          objectId: objectId,
          name: 'file3',
          size: 1024 * 1024 * 50,
          realPath: '/user/local/steven',
          path: '/local/steven',
          type: '1',
          available: '1',
          status: '2',
          description: '',
          archivePath: '',
          createdTime: new Date(),
          lastModifyTime: new Date(),
          details: {}
        }
      ];
      fileInfo.collection.insert(fileinfos, function (err) {
        if(err){
          console.log("error==>", err.message);
        }
        fileInfo.collection.find({objectId: objectId}).toArray(function(err, docs){
          if(err){
            console.log("error===>", err.message);
          }
          
          const infos = [
            {
              _id: uuid.v1(),
              objectId: objectId,
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
                to: '2017-03-25'
              },
              owner: {
                _id: ownerId,
                name: ownerName
              },
              department: {
                _id: departmentId,
                name: departmentName
              },
              createdTime: new Date(),
              lastModifyTime: new Date(),
              details: {}
            },
            {
              _id: uuid.v1(),
              objectId: objectId,
              fileId: docs[1]._id,
              englishName: 'testtt2',
              chineseName: '测试2',
              keyword: 'gggg',
              content: '这是一个测试2',
              source: '',
              version: '1.0.0',
              keyman: '鲁豫',
              language: 'putonghua',
              root: '',
              type: '素材',
              inpoint: 1000,
              outpoint: 2000,
              available: '0',
              materialDate: {
                form: '2017-03-22',
                to: '2017-03-25'
              },
              owner: {
                _id: ownerId,
                name: ownerName
              },
              department: {
                _id: departmentId,
                name: departmentName
              },
              createdTime: new Date(),
              lastModifyTime: new Date(),
              details: {}
            },
            {
              _id: uuid.v1(),
              objectId: objectId,
              fileId: docs[2]._id,
              englishName: 'testtt3',
              chineseName: '测试3',
              keyword: 'gggg',
              content: '这是一个测试3',
              source: '',
              version: '1.0.0',
              keyman: '鲁豫',
              language: 'putonghua',
              root: '',
              type: '素材',
              inpoint: 2000,
              outpoint: 3000,
              available: '0',
              materialDate: {
                form: '2017-03-22',
                to: '2017-03-26'
              },
              owner: {
                _id: ownerId,
                name: ownerName
              },
              department: {
                _id: departmentId,
                name: departmentName
              },
              createdTime: new Date(),
              lastModifyTime: new Date(),
              details: {}
            }
          ];
          
          catalogInfo.collection.insert(infos, function(err){
            if(err){
              console.log(err.message);
            }
          })
        })
      })
    })
  })
})
