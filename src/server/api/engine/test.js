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
    let engineId = '';

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
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
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
              expect(res.body.status).to.equal('-12004');
              done();
            });
      });
    });

    describe('POST /addEngine', () => {
      it('should add a engine', (done) => {
        agent
            .post('/engine/addEngine')
            .send({ name: 'testEngine' })
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
            .get('/engine/listEngine')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              engineId = res.body.data.docs[0]._id;
              done();
            });
      });
    });

    describe('GET /getEngine', () => {
      it('should get a engine by id', (done) => {
        agent
            .get('/engine/getEngine')
            .query({ id: engineId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /updateEngine', () => {
      it('should update a engine by id', (done) => {
        agent
            .post('/engine/updateEngine')
            .send({ _id: engineId, name: 'updatedTestEngine' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

//     describe('POST /updateEngineConfiguration', () => {
//       it('should update a engine configuration by id', (done) => {
//         agent
//         .post('/engine/updateEngineConfiguration')
//         .send({ _id: engineId, configuration: '[{"key":"process","value":"{\\"java\\": {\\"ps\\": {\\"command\\": \\"java -jar transcoding-cluster-0.0.1-SNAPSHOT-jar-with-dependencies.jar\\", \\"description\\": null}}}","description":""}]', ip: '10.0.15.80' })
//         .end((err, res) => {
//           expect(res).to.have.status(200);
//           expect(res.body.status).to.equal('0');
//           done();
//         });
//       });
//     });

    describe('POST /removeEngine', () => {
      it('should remove a engine by id', (done) => {
        agent
            .post('/engine/removeEngine')
            .send({ id: engineId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });
  });

  run();
}, 5000);
