/**
 * Created by steven on 17/5/8.
 */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = require('should');
const path = require('path');
const fs = require('graceful-fs');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);
const config = require('../../config');
const mongodb = require('mongodb');
const uuid = require('uuid');

setTimeout(() => {
  describe('manuscript', () => {
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

    let _id = '';
    describe('#add', () => {
      it('/manuscript/add', (done) => {
        agent
            .post('/manuscript/add')
            .send({
              title: '标题',
              content: '正文',
              viceTitle: '副标题',
              collaborators: [
                { _id: 'b9e77160-da6e-11e7-9ab4-f3602b15a057', name: 'xuyawen' },
              ],
            })
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied
              res.body.status.should.equal('0');
              _id = res.body.data;
              done();
            });
      });
    });

    describe('#listManuscript', () => {
      it('/manuscript/list', (done) => {
        agent
            .get('/manuscript/list')
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

    describe('#getManuscript', () => {
      it('/manuscript/getManuscript', (done) => {
        agent
            .get('/manuscript/getManuscript')
            .query({ _id })
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


    const filePath = path.join(__dirname, 'index.js');
    const attachments = [];
    let attachId = '';
    describe('#addAttachment', () => {
      it('/manuscript/addAttachment', (done) => {
        agent
            .post('/manuscript/addAttachment')
            .attach('file', fs.readFileSync(filePath), 'index.js')
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied
              res.body.status.should.equal('0');
              attachId = res.body.data._id;
              attachments.push(res.body.data);
              done();
            });
      });
    });

    describe('#updateManuscript', () => {
      it('/manuscript/updateManuscript', (done) => {
        agent
            .post('/manuscript/updateManuscript')
            .send({
              _id,
              title: '标题1',
              content: '正文1',
              viceTitle: '副标题1',
              collaborators: [
                "{'_id': 'b9e77160-da6e-11e7-9ab4-f3602b15a057', name: 'xuyawen2'}",
              ],
              attachments,
            })
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

    describe('#changeManuscriptStatus', () => {
      it('/manuscript/changeManuscriptStatus', (done) => {
        agent
            .post('/manuscript/changeManuscriptStatus')
            .send({
              _ids: _id,
              status: '2',
            })
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

    describe('#listAttachments', () => {
      it('/manuscript/listAttachments', (done) => {
        agent
            .get('/manuscript/listAttachments')
            .query({
              manuscriptId: _id,
            })
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


    describe('#deleteAttachments', () => {
      it('/manuscript/deleteAttachments', (done) => {
        agent
            .post('/manuscript/deleteAttachments')
            .send({
              _ids: attachId,
            })
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

    describe('#changeManuscriptStatus', () => {
      it('/manuscript/changeManuscriptStatus', (done) => {
        agent
            .post('/manuscript/changeManuscriptStatus')
            .send({
              _ids: _id,
              status: '4',
            })
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

    describe('#hongKongSimplified', () => {
      it('/manuscript/hongKongSimplified', (done) => {
        agent
            .post('/manuscript/hongKongSimplified')
            .send({
              conversionType: '1',
              title: '你好啊，我是简体呢',
              content: '我很好，你说明天会发生什么',
            })
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
  });

  run();
}, 5000);
