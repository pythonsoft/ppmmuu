'use strict';

// const config = require('../../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);

setTimeout(() => {
  describe('/user', () => {
    const searchHistoryIds = '';

    describe('POST /login', () => {
      it('should login', (done) => {
        agent
        .post('/user/login')
        .send({ username: 'xuyawen', password: '123123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /getToken', () => {
      it('should get token', (done) => {
        agent
        .get('/user/getToken')
        .query({ username: 'xuyawen', password: '123123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /update', () => {
      it('should update token', (done) => {
        agent
        .post('/user/update')
        .send({ displayName: 'xuyawenbbbbbbbbbbb' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /detail', () => {
      it('should get user info', (done) => {
        agent
        .get('/user/detail')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /auth', () => {
      it('should get auth', (done) => {
        agent
        .get('/user/auth')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /changePassword', () => {
      it('should change password', (done) => {
        agent
        .post('/user/changePassword')
        .send({ password: '123123', newPassword: '123123', confirmNewPassword: '123123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('-1008');
          done();
        });
      });
    });

    describe('GET /getSearchHistory', () => {
      it('should get search history', (done) => {
        agent
        .get('/user/getSearchHistory')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /removeSearchHistory', () => {
      it('should remove search history by id', (done) => {
        agent
        .post('/user/removeSearchHistory')
        .send({ ids: '123bbbbbbb' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /clearSearchHistory', () => {
      it('should clear search history', (done) => {
        agent
        .post('/user/clearSearchHistory')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /getWatchHistory', () => {
      it('should get watch history', (done) => {
        agent
        .get('/user/getWatchHistory')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /removeWatchHistory', () => {
      it('should remove watch history by id', (done) => {
        agent
        .post('/user/removeWatchHistory')
        .send({ ids: '123bbbbbbb' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /clearWatchHistory', () => {
      it('should clear watch history', (done) => {
        agent
        .post('/user/clearWatchHistory')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /adAccountSync', () => {
      it('should sync adAccount', (done) => {
        agent
        .post('/user/adAccountSync')
        .send({ infos: [{
          _id: '123bbbbbbbbbbbb',
          name: 'bbbbbbbb',
          companyName: 'bbbbbbbbbb',
          email: 'klaskdjf@klas.klskd',
          departmentName: 'kjsdf',
          verifyType: '1',
          title: '12kj3',
          employeeId: '11111',
          phone: 'ssssssss',
          photo: 'aaaaaaaaa',
          status: '1',
        }] })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listJob', () => {
      it('should get downloadjob', (done) => {
        agent
        .get('/user/listJob')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listMyAuditJob', () => {
      it('should list my audit job', (done) => {
        agent
        .get('/user/listMyAuditJob')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listAuditJob', () => {
      it('should list audit job', (done) => {
        agent
        .get('/user/listAuditJob')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /passOrRejectAudit', () => {
      it('should pass or reject audit', (done) => {
        agent
        .post('/user/passOrRejectAudit')
        .send({ ids: '11111111bbbbbbbbbbb' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /queryJob', () => {
      it('should query job', (done) => {
        agent
        .get('/user/queryJob')
        .query({ jobId: 'jsakdodcivjwlkel' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('1');
          done();
        });
      });
    });

    describe('GET /restartJob', () => {
      it('should restart job', (done) => {
        agent
        .get('/user/restartJob')
        .query({ jobId: 'jsakdodcivjwlkel' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('1');
          done();
        });
      });
    });

    describe('GET /stopJob', () => {
      it('should stop job', (done) => {
        agent
        .get('/user/stopJob')
        .query({ jobId: 'jsakdodcivjwlkel' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('1');
          done();
        });
      });
    });

    describe('GET /deleteJob', () => {
      it('should delete job', (done) => {
        agent
        .get('/user/deleteJob')
        .query({ jobId: 'jsakdodcivjwlkel' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('1');
          done();
        });
      });
    });


    describe('GET /directAuthorize/acceptorList', () => {
      it('should get acceptor list', (done) => {
        agent
        .get('/user/directAuthorize/acceptorList')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('-90002');
          done();
        });
      });
    });

    describe('GET /listUserByDepartment', () => {
      it('should list user', (done) => {
        agent
        .get('/user/listUserByDepartment')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listUsableTemplate', () => {
      it('should list usable template', (done) => {
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
}, 4000);
