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
const mongodb = require('mongodb');

setTimeout(() => {
  describe('/user', () => {
    let searchId = '';
    let watchId = '';
    before((done) => {
      mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
        if (err) {
          console.log(err);
          done();
        }
        const searchHistoryInfo = db.collection('SearchHistoryInfo');
        const watchingHistoryInfo = db.collection('WatchingHistoryInfo');
        searchHistoryInfo.findOne({}, (err, doc) => {
          searchId = doc ? doc._id : '';
          watchingHistoryInfo.findOne({}, (err, doc) => {
            watchId = doc ? doc._id : '';
            done();
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

    describe('GET /user/getToken', () => {
      it('should user getToken', (done) => {
        agent
            .get('/user/getToken')
            .query({
              username: 'xuyawen',
              password: '123123',
            })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /user/update', () => {
      it('should user update', (done) => {
        agent
            .post('/user/update')
            .send({
              name: 'xuyawen',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /user/detail', () => {
      it('should user detail', (done) => {
        agent
            .get('/user/detail')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /user/logout', () => {
      it('should user logout', (done) => {
        agent
            .get('/user/logout')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
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

    describe('POST /user/logout', () => {
      it('should user logout', (done) => {
        agent
            .post('/user/logout')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
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

    describe('GET /user/auth', () => {
      it('should user auth', (done) => {
        agent
            .get('/user/auth')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /user/changePassword', () => {
      it('should user changePassword', (done) => {
        agent
            .post('/user/changePassword')
            .send({
              password: '123123',
              newPassword: '123456',
              confirmNewPassword: '123456',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('#login', () => {
      it('/user/login', (done) => {
        agent
            .post('/user/login')
            .send({ username: 'xuyawen', password: '123456' })
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

    describe('POST /user/changePassword', () => {
      it('should user changePassword', (done) => {
        agent
            .post('/user/changePassword')
            .send({
              password: '123456',
              newPassword: '123123',
              confirmNewPassword: '123123',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
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

    describe('GET /user/getSearchHistory', () => {
      it('should user getSearchHistory', (done) => {
        agent
            .get('/user/getSearchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /user/removeSearchHistory', () => {
      it('should user removeSearchHistory', (done) => {
        agent
            .post('/user/removeSearchHistory')
            .send({
              ids: searchId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              if (searchId) {
                expect(res.body.status).to.equal('0');
              } else {
                res.body.status.should.not.equal('0');
              }
              done();
            });
      });
    });

    describe('POST /user/clearSearchHistory', () => {
      it('should user clearSearchHistory', (done) => {
        agent
            .post('/user/clearSearchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /user/getWatchHistory', () => {
      it('should user getWatchHistory', (done) => {
        agent
            .get('/user/getWatchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /user/removeWatchHistory', () => {
      it('should user removeWatchHistory', (done) => {
        agent
            .post('/user/removeWatchHistory')
            .send({
              ids: watchId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              if (watchId) {
                expect(res.body.status).to.equal('0');
              } else {
                res.body.status.should.not.equal('0');
              }
              done();
            });
      });
    });

    describe('POST /user/clearWatchHistory', () => {
      it('should user clearWatchHistory', (done) => {
        agent
            .post('/user/clearWatchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /user/adAccountSync', () => {
      it('should user adAccountSync', (done) => {
        agent
            .post('/user/adAccountSync')
            .send({
              infos: [
                {
                  _id: 'bbbbb',
                  name: 'vzvzv',
                  companyName: '小红书',
                  departmentName: '组织部',
                  verifyType: '1',
                  email: 'bbcc@qq.com',
                },
                {
                  _id: 'bbbbbc',
                  name: 'vbvb',
                  companyName: '小黄书',
                  departmentName: '搜索部',
                  verifyType: '2',
                  email: 'bbcd@qq.com',
                },
                {
                  _id: 'bbbbbd',
                  name: 'vcvc',
                  companyName: '小蓝书',
                  departmentName: '美术部',
                  verifyType: '1',
                  email: 'bbce@qq.com',
                },
                {
                  _id: 'bbbbbe',
                  name: 'vdvd',
                  companyName: '小黑书',
                  departmentName: '组织部',
                  verifyType: '2',
                  email: 'bbcf@qq.com',
                },
              ],
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let fJobId = '';
    const jobId = [];
    let createdJobId = '';
    let dealingJobId = '';
    describe('GET /user/listJob', () => {
      it('should user listJob', (done) => {
        agent
            .get('/user/listJob')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              const docs = res.body.data.docs;
              if (docs && docs.length > 0) {
                fJobId = docs[0].id;
              }
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

    describe('GET /user/listMyAuditJob', () => {
      it('should user listMyAuditJob', (done) => {
        agent
            .get('/user/listMyAuditJob')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    let auditId = '';
    describe('GET /user/listAuditJob', () => {
      it('should user listAuditJob', (done) => {
        agent
            .get('/user/listAuditJob')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              const docs = res.body.data.docs;
              for (let i = 0, len = docs.length; i < len; i++) {
                if (docs[i].status === '1') {
                  auditId = docs[i]._id;
                  break;
                }
              }
              done();
            });
      });
    });

    describe('POST /user/passOrRejectAudit', () => {
      it('should user passOrRejectAudit', (done) => {
        agent
            .post('/user/passOrRejectAudit')
            .send({
              ids: auditId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              if (auditId) {
                expect(res.body.status).to.equal('0');
              } else {
                res.body.status.should.not.equal('0');
              }
              done();
            });
      });
    });

    describe('GET /user/queryJob', () => {
      it('should user queryJob', (done) => {
        agent
            .get('/user/queryJob')
            .query({
              jobId: fJobId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              if (fJobId) {
                expect(res.body.status).to.equal('0');
              } else {
                res.body.status.should.not.equal('0');
              }
              done();
            });
      });
    });

    describe('GET /user/restartJob', () => {
      it('should user restartJob', (done) => {
        agent
            .get('/user/restartJob')
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

    describe('GET /user/stopJob', () => {
      it('should user stopJob', (done) => {
        agent
            .get('/user/stopJob')
            .query({ jobId: dealingJobId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.statusInfo.message).to.not.equal('');
              done();
            });
      });
    });

    describe('GET /user/deleteJob', () => {
      it('should user deleteJob', (done) => {
        agent
            .get('/user/deleteJob')
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

    describe('GET /user/directAuthorize/acceptorList', () => {
      it('should user directAuthorize acceptorList', (done) => {
        agent
            .get('/user/directAuthorize/acceptorList')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /user/listUserByDepartment', () => {
      it('should user listUserByDepartment', (done) => {
        agent
            .get('/user/listUserByDepartment')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /user/listUsableTemplate', () => {
      it('should user listUsableTemplate', (done) => {
        agent
            .get('/user/listUsableTemplate')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('-150001');
              done();
            });
      });
    });
  });

  run();
}, 5000);
