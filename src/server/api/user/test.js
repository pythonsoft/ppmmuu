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
  });

  run();
}, 4000);
