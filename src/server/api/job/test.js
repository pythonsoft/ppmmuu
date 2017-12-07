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

describe('/job', () => {
  let distributeId = '';
  const groupId = '7ef86f30-c45e-11e7-9d3f-3d7ea0afa179';
  const downloadTemplateId = 'FF';
  const bucketId = 'testg';
  let shelfTaskInfo = '';
  let templateInfo = '';
  let templateGroupInfo = '';
  let bucketInfo = '';
  before((done) => {
    mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
      if (err) {
        console.log(err);
        done();
      }
      shelfTaskInfo = db.collection('ShelfTaskInfo');
      templateInfo = db.collection('TemplateInfo');
      templateGroupInfo = db.collection('TemplateGroupInfo');
      bucketInfo = db.collection('BucketInfo');
      shelfTaskInfo.findOne({}, (err, doc) => {
        distributeId = doc ? doc._id : '';
        const info = {
          _id: groupId,
          name: '分发组',
          creator: {
            _id: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
            name: 'xuyawen',
          },
          parentId: '',
          createdTime: '2017-11-08T08:26:19.427Z',
          modifyTime: '2017-11-08T08:26:19.427Z',
          description: '',
          deleteDeny: '1',
          detail: {},
          users: [],
        };
        templateGroupInfo.insertOne(info, () => {
          const teInfo = {
            _id: downloadTemplateId,
            name: '下载测试',
            creatorId: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
            createdTime: '2017-10-10T06:23:45.233Z',
            type: '1',
            modifyTime: '2017-12-01T11:18:50.055Z',
            description: '',
            details: {
              script: "let storagePath = [\n    year,\n    month,\n    day\n  ].join('\\\\');\n\n  result = '\\\\' + storagePath;",
              bucketId: 'testg',
            },
            groupId: '4191c0b0-b4b9-11e7-85be-f5fc6e2f9f46',
            transcodeTemplateDetail: {
              transcodeTemplates: [
                {
                  _id: '6c3e60d2-bea2-4e1c-a0ce-4a153808412d',
                  name: 'mp4格式720p_TEST',
                  code: 'MP4_720P',
                },
                {
                  _id: '48dcf1d5-250e-4b24-8179-a6fb8fb67208',
                  name: 'xywtt',
                  code: 'xxxxyy',
                },
              ],
              transcodeTemplateSelector: 'result = [];\nresult.push(transcodeTemplates.MP4_720P.id);',
            },
            subtitleType: [
              '1',
              '2',
            ],
            downloadAudit: true,
            groupName: '分组1',
          };
          templateInfo.insertOne(teInfo, () => {
            bucketInfo.insertOne({
              _id: 'testg',
              name: '后端测试11',
              type: '0',
              permission: '2',
              creator: {
                _id: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
                name: 'xuyawen',
              },
              status: '0',
              createdTime: '2017-10-10T07:55:01.547Z',
              modifyTime: '2017-10-10T07:55:01.547Z',
              deleteDeny: '1',
              description: '',
              detail: {},
            }, () => {
              done();
            });
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

  const objectId = '53D7705C-DB29-4509-9A51-15D0A2298205';
  describe('POST /shelves/createShelfTask', () => {
    it('should shelves createShelfTask', (done) => {
      agent
          .post('/shelves/createShelfTask')
          .send({
            name: 'testttt',
            objectId,
            force: true,
            fromWhere: 'MAM',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            distributeId = res.body.data;
            done();
          });
    });
  });

  describe('POST /job/download', () => {
    it('should job download', (done) => {
      agent
          .post('/job/download')
          .send({
            fileId: '',
            filename: 'PANO HANDSHAKE PUS MONTOFRI TONG_DC0B0932-FB8E-426C-94BF-CEA22516EA69.mxf',
            filetypeid: '040130E8-9C84-4D0B-B181-AC5B9D523EF0',
            fromWhere: 'MAM',
            inpoint: 0,
            outpoint: 0,
            objectid: '605AB8B9-9A0D-400F-96B6-F307E78EF6E3',
            templateId: 'FF',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /job/multiDownload', () => {
    it('should job multiDownload', (done) => {
      agent
          .post('/job/multiDownload')
          .send({
            downloadParams: [
              {
                destination: '',
                filename: 'PANO HANDSHAKE PUS MONTOFRI TONG_DC0B0932-FB8E-426C-94BF-CEA22516EA69.mxf',
                filetypeid: '040130E8-9C84-4D0B-B181-AC5B9D523EF0',
                inpoint: 0,
                objectid: '605AB8B9-9A0D-400F-96B6-F307E78EF6E3',
                outpoint: 0,
                targetname: '',
              },
              {
                destination: '',
                filename: '築夢天下/ 雅居樂地產',
                filetypeid: '040130E8-9C84-4D0B-B181-AC5B9D523EF0',
                inpoint: 0,
                objectid: '5BC5A00F-CB9E-418C-A464-A99A00B5B0D7',
                outpoint: 0,
                targetname: '',
              },
            ],
            fileInfo: [
              {
                fileId: '',
                startTime: ['00:00:00', '00:00:00'],
                endTime: ['00:00:02.801', '00:00:02.801'],
              },
              {
                fileId: '',
                startTime: ['00:00:00', '00:00:00'],
                endTime: ['00:00:02.419', '00:00:02.419'],
              },
            ],
            filename: 'PANO HANDSHAKE PUS MONTOFRI TONG_DC0B0932-FB8E-426C-94BF-CEA22516EA69.mxf',
            fromWhere: 'MAM',
            objectid: '7AD7D9BC-FBA9-4BC3-8533-D311FE33FE99,5BC5A00F-CB9E-418C-A464-A99A00B5B0D7',
            templateId: 'FF',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  let templateId = '';
  describe('POST /job/createTemplate', () => {
    it('should job createTemplate', (done) => {
      agent
          .post('/job/createTemplate')
          .send({ createJson: { templateName: 'test',
            templateCode: 'test',
            fileformat: 'mxf',
            enablevideo: 'true',
            vcodec: 'libx264',
            pixfmt: 'yuv420p',
            gop: 'null',
            ref: 'null',
            wh: '1920x1080',
            vbitrate: '150000000',
            framerate: '25',
            progressive: 'true',
            scaletype: 'null',
            bframes: 'null',
            level: 'null',
            tsbitrate: 'null',
            watermarkFile: 'null',
            isUsed: '0',
            position: '0',
            xmargin: 'null',
            ymargin: 'null',
            enableaudio: 'true',
            acodec: 'libfdk_aac',
            channels: '2',
            samplerate: '48000',
            abitrate: '128000',
            enableAudioMap: 'null',
            intra: '0',
            audioIndexs: 'null',
            w: '1920',
            h: '1080' },
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            templateId = res.body.statusInfo.message;
            done();
          });
    });
  });

  const createItemId = '';
  describe('POST /job/updateTemplate', () => {
    it('should job update template', (done) => {
      agent
          .post('/job/updateTemplate')
          .send({
            updateJson: { templateName: 'test',
              id: templateId,
              templateCode: 'test',
              fileformat: 'mxf',
              enablevideo: 'true',
              vcodec: 'libx264',
              pixfmt: 'yuv420p',
              gop: 'null',
              ref: 'null',
              wh: '1920x1080',
              vbitrate: '150000000',
              framerate: '25',
              progressive: 'true',
              scaletype: 'null',
              bframes: 'null',
              level: 'null',
              tsbitrate: 'null',
              watermarkFile: 'null',
              isUsed: '0',
              position: '0',
              xmargin: 'null',
              ymargin: 'null',
              enableaudio: 'true',
              acodec: 'libfdk_aac',
              channels: '2',
              samplerate: '48000',
              abitrate: '128000',
              enableAudioMap: 'null',
              intra: '0',
              audioIndexs: 'null',
              w: '1920',
              h: '1080' },
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  const jobId = [];
  let createdJobId = '';
  let dealingJobId = '';
  describe('GET /job/list', () => {
    it('should job list', (done) => {
      agent
          .get('/job/list')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            const docs = res.body.data.docs;
            if (docs && docs.length > 0) {
              for (let i = 0, len = docs.length; i < len; i++) {
                const status = docs[i].status;
                if (status === 'error') {
                  jobId.push(docs[i].id);
                } else if (status === 'created') {
                  createdJobId = docs[i].id;
                } else if (status === 'dealing') {
                  dealingJobId = docs[i].id;
                }
              }
            }
            done();
          });
    });
  });

  describe('GET /job/listTemplate', () => {
    it('should job listTemplate', (done) => {
      agent
          .get('/job/listTemplate')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /job/query', () => {
    it('should job query', (done) => {
      agent
          .get('/job/query')
          .query({ jobId: jobId[0] || createdJobId })
          .end((err, res) => {
            expect(res).to.have.status(200);
            if (jobId[0] || createdJobId) {
              expect(res.body.status).to.equal('0');
            } else {
              res.body.status.should.not.equal('0');
            }
            done();
          });
    });
  });

  describe('GET /job/restart', () => {
    it('should job restart', (done) => {
      agent
          .get('/job/restart')
          .query({ jobId: jobId[0] })
          .end((err, res) => {
            expect(res).to.have.status(200);
            if (jobId[0]) {
              expect(res.body.status).to.equal('0');
            } else {
              res.body.status.should.not.equal('0');
            }
            done();
          });
    });
  });

  describe('GET /job/stop', () => {
    it('should job stop', (done) => {
      agent
          .get('/job/stop')
          .query({ jobId: dealingJobId })
          .end((err, res) => {
            expect(res).to.have.status(200);
            if (dealingJobId) {
              expect(res.body.status).to.equal('0');
            } else {
              res.body.status.should.not.equal('0');
            }
            done();
          });
    });
  });

  describe('GET /job/delete', () => {
    it('should job delete', (done) => {
      agent
          .get('/job/delete')
          .query({ jobId: jobId[1] })
          .end((err, res) => {
            expect(res).to.have.status(200);
            if (jobId[1]) {
              expect(res.body.status).to.equal('0');
            } else {
              res.body.status.should.not.equal('0');
            }
            done();
          });
    });
  });

  describe('GET /job/deleteTemplate', () => {
    it('should job deleteTemplate', (done) => {
      agent
          .get('/job/deleteTemplate')
          .query({
            templateId,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            if (templateId) {
              expect(res.body.status).to.equal('0');
            } else {
              res.body.status.should.not.equal('0');
            }
            done();
          });
    });
  });

  describe('GET /job/mediaExpressDispatch', () => {
    it('should mediaExpressDispatch', (done) => {
      agent
          .get('/job/mediaExpressDispatch')
          .query({
            distributionId: distributeId,
            filetypeId: '040130E8-9C84-4D0B-B181-AC5B9D523EF0',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('-150004');
            done();
          });
    });
  });

  after((done) => {
    shelfTaskInfo.remove({ _id: distributeId }, () => {
      templateGroupInfo.remove({ _id: groupId }, () => {
        templateInfo.remove({ _id: downloadTemplateId }, () => {
          bucketInfo.remove({ _id: bucketId }, () => {
            done();
          });
        });
      });
    });
  });
});

