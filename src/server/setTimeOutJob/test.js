'use strict';

const chai = require('chai');
const app = require('../app');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;
const agent = chai.request.agent(app);

setTimeout(() => {
  let userId = '';
  const WatchingHistoryInfo = require('../api/user/watchingHistoryInfo');
  const watchingHistoryInfo = new WatchingHistoryInfo();
  const UserInfo = require('../api/user/userInfo');
  const userInfo = new UserInfo();

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
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  const objectId = '53D7705C-DB29-4509-9A51-15D0A2298205';

  describe('GET /media/getStream', () => {
    it('should media getStream', (done) => {
      agent
          .get('/media/getStream')
          .query({ objectid: objectId, fromWhere: 'MAM' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('cached MediaList', () => {
    describe('/cached MediaList', () => {
      it('should cached MediaList', (done) => {
        agent
            .get('/media/defaultMedia')
            .query({ size: 4 })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              const rs = res.body.data;
              for (const key in rs) {
                expect(rs[key].docs).to.have.lengthOf.at.least(1);
                expect(rs[key].docs).to.have.lengthOf.at.most(4);
              }
              done();
            });
      });
    });


    describe('mediaHistoryContent', () => {
      it('should mediaHistoryContent', (done) => {
        setTimeout(() => {
          userInfo.collection.findOne({ name: 'xuyawen' }, (err, doc) => {
            if (err) {
              console.log(err);
            }
            userId = doc ? doc._id : '';
            watchingHistoryInfo.collection.findOne({ videoId: objectId, userId }, (err, doc) => {
              if (err) {
                console.log(err);
              }
              const videoContent = doc ? doc.videoContent : {};
              let updatedTime = doc ? doc.updatedTime : '1990-01-01';
              updatedTime = new Date(updatedTime);
              const t = new Date();
              t.setSeconds(t.getSeconds() - 9);
              expect(updatedTime).to.be.above(t);
              expect(videoContent.full_text).to.have.lengthOf.at.least(1);
              done();
            });
          });
        }, 8000);
      });
    });
  });

  run();
}, 5000);
