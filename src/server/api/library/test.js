/**
 * Created by steven on 17/5/8.
 */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = require('should');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);
const config = require('../../config');
const mongodb = require('mongodb');
const uuid = require('uuid');

setTimeout(() => {
  describe('/library', () => {
    let userId = '';
    let catalogTaskInfo = '';
    let catalogInfo = '';
    let fileInfo = '';
    let groupInfo = '';
    const parentId = '28767af0-606b-11e7-9066-d9d30fbb84c0';
    const departmentId = '2c189400-6083-11e7-80d5-61ac588ddf98';
    before((done) => {
      mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
        if (err) {
          console.log(err);
          done();
        }
        const userInfo = db.collection('UserInfo');
        catalogTaskInfo = db.collection('Library_CatalogTaskInfo');
        catalogInfo = db.collection('Library_CatalogInfo');
        fileInfo = db.collection('Library_FileInfo');
        groupInfo = db.collection('GroupInfo');
        userInfo.findOne({}, (err, doc) => {
          userId = doc ? doc._id : '';
          groupInfo.insertOne({
            _id: parentId,
            name: '中国凤凰卫视',
            logo: 'http://localhost:8080/uploads/baa8fb5a1fb9567ba2b054c3fb23080e',
            creator: {
              _id: 'xuyawen@phoenixtv.com',
              name: 'xuyawen',
            },
            parentId: '',
            contact: {
              _id: 'asfasf',
              name: 'xuyawen',
              phone: '18719058667',
              email: 'asfasf@qq.com',
            },
            memberCount: 50,
            ad: '',
            type: '0',
            createdTime: '2017-07-04T03:44:47.787Z',
            modifyTime: '2017-07-04T03:44:47.787Z',
            description: '',
            deleteDeny: '1',
            detail: {},
            t: 1510314404064.0,
            mediaExpressUser: {
              username: '',
              password: '',
              userType: '',
              companyName: '',
              email: '',
            },
          }, () => {
            groupInfo.insertOne({
              _id: departmentId,
              name: '宣传部',
              logo: '',
              creator: {
                _id: 'xuyawen@phoenixtv.com',
                name: 'xuyawen',
              },
              parentId,
              contact: {
                name: '',
                phone: '',
                email: '',
              },
              memberCount: 0,
              ad: '',
              type: '1',
              createdTime: '2017-07-04T06:36:44.472Z',
              modifyTime: '2017-07-04T06:36:55.498Z',
              description: '',
              deleteDeny: '0',
              detail: {},
              t: 1509100084234.0,
            }, () => {
              done();
            });
          });
        });
      });
    });

    describe('#login', () => {
      it('/user/login', (done) => {
        agent
            .post('/user/login')
            .send({ username: 'xuyawen', password: '123123' })
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied
              res.body.status.should.equal('0');
              done();
            });
      });
    });

    describe('POST /library/getAsyncCatalogInfoList', () => {
      it('should library getAsyncCatalogInfoList', (done) => {
        agent
            .get('/library/getAsyncCatalogInfoList')
            .query({
              lastmodify: '20170929112434',
              count: 5,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              res.body.data.length.should.lessThanOrEqual(5);
              done();
            });
      });
    });

    let taskId = '';
    const objectId = '7646F4DA-0165-4AAC-929C-62614AE25CA1';
    describe('POST /library/createCatalogTask', () => {
      it('should library createCatalogTask', (done) => {
        agent
            .post('/library/createCatalogTask')
            .send({
              departmentId: '',
              departmentName: '',
              name: 'testtest',
              objectId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              taskId = res.body.data._id;
              done();
            });
      });
    });

    describe('GET /library/getCatalogTask', () => {
      it('should library getCatalogTask', (done) => {
        agent
            .get('/library/getCatalogTask')
            .query({ id: taskId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/listDepartmentCatalogTask', () => {
      it('should library listDepartmentCatalogTask', (done) => {
        agent
            .get('/library/listDepartmentCatalogTask')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/listMyCatalogTask', () => {
      it('should library listMyCatalogTask', (done) => {
        agent
            .get('/library/listMyCatalogTask')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/assignCatalogTask', () => {
      it('should library assignCatalogTask', (done) => {
        agent
            .post('/library/assignCatalogTask')
            .send({
              taskIds: taskId,
              ownerId: userId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/sendBackCatalogTask', () => {
      it('should library sendBackCatalogTask', (done) => {
        agent
            .post('/library/sendBackCatalogTask')
            .send({
              taskIds: taskId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/applyCatalogTask', () => {
      it('should library applyCatalogTask', (done) => {
        agent
            .post('/library/applyCatalogTask')
            .send({
              taskIds: taskId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/submitCatalogTask', () => {
      it('should library submitCatalogTask', (done) => {
        agent
            .post('/library/submitCatalogTask')
            .send({
              taskIds: taskId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/deleteCatalogTask', () => {
      it('should library deleteCatalogTask', (done) => {
        agent
            .post('/library/deleteCatalogTask')
            .send({ taskIds: taskId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/resumeCatalogTask', () => {
      it('should library resumeCatalogTask', (done) => {
        agent
            .post('/library/resumeCatalogTask')
            .send({ taskIds: taskId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let catalogId = '';
    describe('POST /library/createCatalog', () => {
      it('should library createCatalog', (done) => {
        agent
            .post('/library/createCatalog')
            .send({
              fileInfo: {
                _id: '0cebd1e1-a436-11e7-b6a8-238901cd3f04',
                name: 'file1',
                realPath: '/user',
                size: 31457280,
                type: '0',
                duration: '0',
              },
              objectId,
              englishName: 'INFO STREAM SMART ELDERLY PHK YIN TOD HD',
              chineseName: 'INFO STREAM SMART ELDERLY PHK YIN TOD HD',
              parentId: '',
              keyword: 'asd',
              content: 'aas',
              source: 'MAM',
              version: '1',
              duration: '00:00:00:00',
              keyman: 'dddd',
              language: 'cn',
              root: '',
              type: '素材',
              inpoint: 0,
              outpoint: 0,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              catalogId = res.body.data._id;
              done();
            });
      });
    });

    describe('POST /library/updateCatalog', () => {
      it('should library updateCatalog', (done) => {
        agent
            .post('/library/updateCatalog')
            .send({
              id: catalogId,
              englishName: 'INFO STREAM SMART ELDERLY PHK YIN TOD HD',
              chineseName: 'INFO STREAM SMART ELDERLY PHK YIN TOD HD',
              parentId: '',
              keyword: '',
              content: 'aas',
              source: 'MAM',
              version: '',
              duration: '00:00:00:00',
              keyman: 'dddd',
              language: 'cn',
              root: '',
              type: '素材',
              inpoint: 0,
              outpoint: 0,
              version: '1.0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/getCatalog', () => {
      it('should library getCatalog', (done) => {
        agent
            .get('/library/getCatalog')
            .query({ id: catalogId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/listCatalog', () => {
      it('should library listCatalog', (done) => {
        agent
            .get('/library/listCatalog')
            .query({ objectId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let fileId = '';
    describe('POST /library/createFile', () => {
      it('should library createFile', (done) => {
        agent
            .post('/library/createFile')
            .send({
              objectId,
              jobId: '',
              name: 'timecode_1.mxf',
              size: 900,
              realPath: '/mnt/transcoding/timecode_1.mxf',
              path: '/mnt/transcoding/timecode_1.mxf',
              type: '0',
              available: '0',
              status: '0',
              description: '',
              archivePath: '',
              createdTime: '2017-09-29T08:24:51.259Z',
              lastModifyTime: '2017-09-29T08:24:51.259Z',
              details: {},
              fromWhere: 'HK_RUKU',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              fileId = res.body.data._id;
              done();
            });
      });
    });

    describe('POST /library/updateFile', () => {
      it('should library updateFile', (done) => {
        agent
            .post('/library/updateFile')
            .send({
              _id: fileId,
              name: 'timecode_1.mxf',
              size: 900,
              realPath: '/mnt/transcoding/timecode_1.mxf',
              path: '/mnt/transcoding/timecode_1.mxf',
              type: '0',
              available: '0',
              status: '0',
              createdTime: '2017-09-29T08:24:51.259Z',
              lastModifyTime: '2017-09-29T08:24:51.259Z',
              fromWhere: 'HK_RUKU',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/listFile', () => {
      it('should library listFile', (done) => {
        agent
            .get('/library/listFile')
            .query({ objectId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/generateXML', () => {
      it('should library generateXML', (done) => {
        agent
            .get('/library/generateXML')
            .query({ objectId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let templateId = '';
    describe('POST /library/addTemplate', () => {
      it('should library addTemplate', (done) => {
        agent
            .post('/library/addTemplate')
            .send({
              _id: '',
              source: 'vvvv',
              departmentId,
              hdExt: '.mxf',
              transcodeScript: '',
              transcodeTemplates: '[]',
              bucketId: 'testg',
              t: 1512469715744,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              templateId = res.body.data._id;
              done();
            });
      });
    });

    describe('GET /library/getTemplateInfo', () => {
      it('should library getTemplateInfo', (done) => {
        agent
            .get('/library/getTemplateInfo')
            .query({ _id: templateId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/getTemplateResult', () => {
      it('should library getTemplateResult', (done) => {
        agent
            .get('/library/getTemplateResult')
            .query({ _id: templateId, filePath: 'aad' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /library/listTemplate', () => {
      it('should library listTemplate', (done) => {
        agent
            .get('/library/listTemplate')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/updateTemplate', () => {
      it('should library updateTemplate', (done) => {
        agent
            .post('/library/updateTemplate')
            .send({
              _id: templateId,
              source: 'vvvv',
              departmentId: '2c189400-6083-11e7-80d5-61ac588ddf98',
              hdExt: '.mxf',
              transcodeScript: '',
              transcodeTemplates: '[]',
              bucketId: 'testg',
              t: 1512469715744,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /library/removeTemplate', () => {
      it('should library removeTemplate', (done) => {
        agent
            .post('/library/removeTemplate')
            .send({ _id: templateId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    after((done) => {
      catalogTaskInfo.remove({ _id: taskId }, () => {
        catalogInfo.remove({ _id: catalogId }, () => {
          fileInfo.remove({ _id: fileId }, () => {
            done();
          });
        });
      });
    });
  });

  run();
}, 5000);

