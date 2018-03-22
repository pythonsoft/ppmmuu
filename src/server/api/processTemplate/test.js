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
const fs = require('fs');
const path = require('path');

setTimeout(() => {
  describe('/template', () => {
    before((done) => {
      done();
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

    let groupId = '';
    describe('POST /template/addGroup', () => {
      it('should template addGroup', (done) => {
        agent
            .post('/template/addGroup')
            .send({
              id: 'test',
              name: 'test',
            })
            .end((err, res) => {
              console.log('addGroup==>', res.body);
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              groupId = res.body.data;
              done();
            });
      });
    });

    describe('POST /template/updateGroup', () => {
      it('should template updateGroup', (done) => {
        agent
            .post('/template/updateGroup')
            .send({
              groupId: 'test',
              name: 'test',
              deleteDeny: '0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /template/getGroup', () => {
      it('should template getGroup', (done) => {
        agent
            .get('/template/getGroup')
            .query({ groupId })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /template/listGroup', () => {
      it('should template listGroup', (done) => {
        agent
            .get('/template/listGroup')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /template/list', () => {
      it('should template list', (done) => {
        agent
            .get('/template/list')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    const templateId = 'testt';
    describe('POST /template/createDownloadTemplate', () => {
      it('should template createDownloadTemplate', (done) => {
        agent
            .post('/template/createDownloadTemplate')
            .send({
              id: templateId,
              name: 'test',
              bucketId: 'testg',
              groupId,
              groupName: '分组1',
              script: 'const pathA = ${paths.A};\n\n          let storagePath = [\n            pathA.windowsStoragePath,\n            userInfo.name,\n            year,\n            month,\n            day\n          ].join(\'/\');\n\n          result = storagePath;',
              type: '2',
              subtitleType: ['0'],
              downloadAudit: true,
              transcodeTemplateSelector: '',
              transcodeTemplates: '[{"_id":"d5fe00c9-5970-4b86-aac9-731c097e2e0e","name":"12321","code":"123213"},{"_id":"c1930683-c7c2-4fd2-a663-1da06a1506bc","name":"qweqwe","code":"qweqwe"}]',
              creatorId: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /template/update', () => {
      it('should template update', (done) => {
        agent
            .post('/template/update')
            .send({
              id: templateId,
              name: 'test',
              bucketId: 'testg',
              groupId: '4191c0b0-b4b9-11e7-85be-f5fc6e2f9f46',
              groupName: '分组1',
              script: 'const pathA = ${paths.A};\n\n          let storagePath = [\n            pathA.windowsStoragePath,\n            userInfo.name,\n            year,\n            month,\n            day\n          ].join(\'/\');\n\n          result = storagePath;',
              type: '2',
              subtitleType: ['0'],
              downloadAudit: true,
              transcodeTemplateSelector: '',
              transcodeTemplates: '[{"_id":"d5fe00c9-5970-4b86-aac9-731c097e2e0e","name":"12321","code":"123213"},{"_id":"c1930683-c7c2-4fd2-a663-1da06a1506bc","name":"qweqwe","code":"qweqwe"}]',
              creatorId: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /template/getDetail', () => {
      it('should template getDetail', (done) => {
        agent
            .post('/template/getDetail')
            .send({
              id: templateId,
            })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /template/search/userOrGroup', () => {
      it('should template search userOrGroup', (done) => {
        agent
            .get('/template/search/userOrGroup')
            .query({
              type: '0',
              keyword: 'x',
            })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /template/updateGroupUser', () => {
      it('should template updateGroupUser', (done) => {
        agent
            .post('/template/updateGroupUser')
            .send({
              _id: templateId,
              users: [{
                type: '1',
                name: '宣传部',
                _id: '2c189400-6083-11e7-80d5-61ac588ddf98',
                photo: '',
              },
              {
                type: '1',
                name: '小部门',
                _id: '3f4c3ad0-baca-11e7-86de-9b53c2c58dbd',
                photo: '',
              }],
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    describe('POST /template/remove', () => {
      it('should template remove', (done) => {
        agent
            .post('/template/remove')
            .send({ id: templateId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    describe('POST /template/removeGroup', () => {
      it('should template removeGroup', (done) => {
        agent
            .post('/template/removeGroup')
            .send({
              groupId,
            })
            .end((err, res) => {
              console.log('dasd==>', res.body);
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    const filePath = path.join(__dirname, 'index.js');
    let watemarkId = '';
    describe('POST /upload/uploadWatermark', () => {
      it('should upload uploadWatermark', (done) => {
        agent
            .post('/upload/uploadWatermark')
            .attach('file', fs.readFileSync(filePath), 'index.png')
            .end((err, res) => {
              const rs = JSON.parse(res.text);
              expect(res).to.have.status(200);
              expect(rs.status).to.equal('0');
              watemarkId = rs.statusInfo.message;
              done();
            });
      });
    });

    describe('GET /template/getWatermark', () => {
      it('should template getWatermark', (done) => {
        agent
            .get('/template/getWatermark')
            .query({ objectid: watemarkId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              done();
            });
      });
    });
  });

  run();
}, 5000);

