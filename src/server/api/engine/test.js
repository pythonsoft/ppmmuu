'use strict';

// const config = require('../../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);

setTimeout(() => {
  describe('/engine', () => {
    let groupId = '';

    before((done) => {
      agent
      .post('/user/login')
      .send({ username: 'xuyawen', password: '123123' })
      .end((err, res) => {
        expect(res).to.have.header('set-cookie');
        done();
      });
    });

    describe('POST /addGroup', () => {
      it('should add a engine group', (done) => {
        agent
        .post('/engine/addGroup')
        .send({ name: 'testGroup' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listGroup', () => {
      it('should get all engine groups', (done) => {
        agent
        .get('/engine/listGroup')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          groupId = res.body.data.docs[0]._id;
          done();
        });
      });
    });

    describe('GET /getGroup', () => {
      it('should get a engine group by id', (done) => {
        agent
        .get('/engine/getGroup')
        .query({ groupId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /updateGroup', () => {
      it('should update a engine group by id', (done) => {
        agent
        .post('/engine/updateGroup')
        .send({ groupId, name: 'updatedTestGroup' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('POST /removeGroup', () => {
      it('should remove a engine group by id', (done) => {
        agent
        .post('/engine/removeGroup')
        .send({ groupId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('0');
          done();
        });
      });
    });

    describe('GET /listEngine', () => {
      it('should list engines', (done) => {
        agent
        .get('')
      })
    });
  });

  run();
}, 2000);
