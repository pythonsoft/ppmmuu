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

describe('/transcode', () => {
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

  let dealingId = '';
  let errorId = '';
  let completeId = '';
  describe('GET /transcode/list', () => {
    it('should transcode list', (done) => {
      agent
          .get('/transcode/list')
          .end((err, res) => {
            expect(res.body.status).to.equal('0');
            const docs = res.body.data.docs;
            for (let i = 0, len = docs.length; i < len; i++) {
              const status = docs[i].status;
              const _id = docs[i].id;
              if (status === 'dealing') {
                dealingId = _id;
              } else if (status === 'error') {
                errorId = _id;
              } else if (status === 'complete') {
                completeId = _id;
              }
            }
            done();
          });
    });
  });

  describe('POST /transcode/listChildTask', () => {
    it('should transcode listChildTask', (done) => {
      agent
          .get('/transcode/listChildTask')
          .query({
            parentId: completeId,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('GET /transcode/restart', () => {
    it('should transcode restart', (done) => {
      agent
          .get('/transcode/restart')
          .query({
            parentId: errorId,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
    });
  });

  describe('GET /transcode/stop', () => {
    it('should transcode stop', (done) => {
      agent
          .get('/transcode/stop')
          .query({
            parentId: dealingId,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
    });
  });
});

