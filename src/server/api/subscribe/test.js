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


setTimeout(() => {
  describe('/subscribe', () => {
    let shelfTaskId = '';
    before((done) => {
      mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
        if (err) {
          console.log(err);
          done();
        }
        const shelfTaskInfo = db.collection('ShelfTaskInfo');
        shelfTaskInfo.findOne({}, (err, doc) => {
          shelfTaskId = doc ? doc._id : '';
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

    describe('GET /subscribe/getSubscribeInfo', () => {
      it('should subscribe getSubscribeInfo', (done) => {
        agent
            .get('/subscribe/getSubscribeInfo')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribe/getSubscribeTypeSummary', () => {
      it('should subscribe getSubscribeTypeSummary', (done) => {
        agent
            .get('/subscribe/getSubscribeTypeSummary')
            .end((err, res) => {
              expect(res.body.status).to.equal('-140001');
              done();
            });
      });
    });

    describe('POST /subscribe/esSearch', () => {
      it('should subscribe esSearch', (done) => {
        agent
            .post('/subscribe/esSearch')
            .send({ keyword: '中国', start: 0, pageSize: 20 })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('-140001');
              done();
            });
      });
    });

    describe('GET /subscribe/getEsMediaList', () => {
      it('should subscribe getEsMediaList', (done) => {
        agent
            .get('/subscribe/getEsMediaList')
            .end((err, res) => {
              expect(res.body.status).to.equal('-140001');
              done();
            });
      });
    });

    describe('GET /subscribe/getSubscribeSearchConfig', () => {
      it('should subscribe getSubscribeSearchConfig', (done) => {
        agent
            .get('/subscribe/getSubscribeSearchConfig')
            .end((err, res) => {
              expect(res.body.status).to.equal('-140001');
              done();
            });
      });
    });

    describe('GET /subscribe/getVideoInfo', () => {
      it('should subscribe getVideoInfo', (done) => {
        agent
            .get('/subscribe/getVideoInfo')
            .query({
              _id: shelfTaskId,
            })
            .end((err, res) => {
              expect(res.body.status).to.equal('-140001');
              done();
            });
      });
    });
  });

  run();
}, 5000);

