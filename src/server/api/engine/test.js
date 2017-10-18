'use strict';

// const config = require('../../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);

setTimeout(function () {
  describe('/engine', () => {
    before((done) => {
      agent
      .post('/user/login')
      .send({ username: 'xuyawen', password: '123123' })
      .end((err, res) => {
        expect(res).to.have.header('set-cookie');
        done();
      });
    });

    describe('GET /listGroup', () => {
      it('should get all engine groups', (done) => {
        agent
        .get('/engine/listGroup')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
      });
    });
  });

  run();
}, 10000);

