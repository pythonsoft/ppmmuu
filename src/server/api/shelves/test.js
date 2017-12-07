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

describe('/shelves', () => {
  let shelfTaskInfo = '';
  let userId = '';
  const username = 'xuyawen';
  before((done) => {
    mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
      if (err) {
        console.log(err);
        done();
      }
      shelfTaskInfo = db.collection('ShelfTaskInfo');
      const userInfo = db.collection('UserInfo');
      userInfo.findOne({ name: username }, (err, doc) => {
        userId = doc ? doc._id : '';
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

  const objectId = '53D7705C-DB29-4509-9A51-15D0A2298205';
  let shelfTaskId = '';
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
            shelfTaskId = res.body.data;
            done();
          });
    });
  });

  describe('GET /shelves/getShelfDetail', () => {
    it('should shelves getShelfDetail', (done) => {
      agent
          .get('/shelves/getShelfDetail')
          .query({ _id: shelfTaskId })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/listDepartmentPrepareShelfTask', () => {
    it('should shelves listDepartmentPrepareShelfTask', (done) => {
      agent
          .get('/shelves/listDepartmentPrepareShelfTask')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/claimShelfTask', () => {
    it('should shelves claimShelfTask', (done) => {
      agent
          .post('/shelves/claimShelfTask')
          .send({ _ids: shelfTaskId })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/sendBackShelf', () => {
    it('should shelves sendBackShelf', (done) => {
      agent
          .post('/shelves/sendBackShelf')
          .send({ _ids: shelfTaskId })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/assignShelfTask', () => {
    it('should shelves assignShelfTask', (done) => {
      agent
          .post('/shelves/assignShelfTask')
          .send({ _ids: shelfTaskId, dealer: { _id: userId, name: username } })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/listDepartmentShelfTask', () => {
    it('should shelves listDepartmentShelfTask', (done) => {
      agent
          .get('/shelves/listDepartmentShelfTask')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/listMyselfShelfTask', () => {
    it('should shelves listMyselfShelfTask', (done) => {
      agent
          .get('/shelves/listMyselfShelfTask')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/saveShelf', () => {
    it('should shelves saveShelf', (done) => {
      agent
          .post('/shelves/saveShelf')
          .send({
            _id: shelfTaskId,
            editorInfo: {
              subscribeType: '体育',
              source: 'MAM',
              cover: 'test',
            },
          })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/submitShelf', () => {
    it('should shelves submitShelf', (done) => {
      agent
          .post('/shelves/submitShelf')
          .send({
            _id: shelfTaskId,
            editorInfo: {
              subscribeType: '体育',
              source: 'MAM',
              cover: 'test',
            },
          })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/listLineShelfTask', () => {
    it('should shelves listLineShelfTask', (done) => {
      agent
          .get('/shelves/listLineShelfTask')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/onlineShelfTask', () => {
    it('should shelves onlineShelfTask', (done) => {
      agent
          .post('/shelves/onlineShelfTask')
          .send({
            _ids: shelfTaskId,
          })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/offlineShelfTask', () => {
    it('should shelves offlineShelfTask', (done) => {
      agent
          .post('/shelves/offlineShelfTask')
          .send({
            _ids: shelfTaskId,
          })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/editShelfTaskAgain', () => {
    it('should shelves editShelfTaskAgain', (done) => {
      agent
          .post('/shelves/editShelfTaskAgain')
          .send({
            _id: shelfTaskId,
          })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /shelves/deleteShelfTask', () => {
    it('should shelves deleteShelfTask', (done) => {
      agent
          .post('/shelves/deleteShelfTask')
          .send({ _ids: shelfTaskId })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/searchUser', () => {
    it('should shelves searchUser', (done) => {
      agent
          .get('/shelves/searchUser')
          .query({ keyword: 'x' })
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /shelves/listSubscribeType', () => {
    it('should shelves listSubscribeType', (done) => {
      agent
          .get('/shelves/listSubscribeType')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  after((done) => {
    shelfTaskInfo.remove({
      name: 'testttt',
      objectId,
    }, () => {
      done();
    });
  });
});

