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

setTimeout(() => {
  describe('/storage', () => {
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

    let bucketId = '';
    describe('POST /storage/addBucket', () => {
      it('should storage addBucket', (done) => {
        agent
            .post('/storage/addBucket')
            .send({
              name: 'testttt',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              bucketId = res.body.data;

              done();
            });
      });
    });

    describe('GET /storage/listBucket', () => {
      it('should storage listBucket', (done) => {
        agent
            .get('/storage/listBucket')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /storage/getBucketDetail', () => {
      it('should storage getBucketDetail', (done) => {
        agent
            .get('/storage/getBucketDetail')
            .query({
              _id: bucketId,
            })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/updateBucket', () => {
      it('should storage updateBucket', (done) => {
        agent
            .post('/storage/updateBucket')
            .send({
              _id: bucketId,
              name: 'testttt',
              deleteDeny: '0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/enableBucket', () => {
      it('should storage enableBucket', (done) => {
        agent
            .post('/storage/enableBucket')
            .send({
              _id: bucketId,
              status: '0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let pathId = '';
    describe('POST /storage/addPath', () => {
      it('should storage addPath', (done) => {
        agent
            .post('/storage/addPath')
            .send({
              _id: 'test',
              viceId: 'test',
              name: 'test',
              path: 'test',
              maxSize: 10,
              type: '0',
              bucket: {
                _id: bucketId,
              },
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              pathId = res.body.data;
              done();
            });
      });
    });

    describe('POST /storage/updatePath', () => {
      it('should storage updatePath', (done) => {
        agent
            .post('/storage/updatePath')
            .send({
              _id: 'test',
              name: 'test',
              path: 'test',
              maxSize: 10,
              type: '0',
              bucket: {
                _id: bucketId,
              },
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/enablePath', () => {
      it('should storage enablePath', (done) => {
        agent
            .post('/storage/enablePath')
            .send({
              _id: 'test',
              status: '0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /storage/listPath', () => {
      it('should storage listPath', (done) => {
        agent
            .get('/storage/listPath')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    let tacticsId = '';
    describe('POST /storage/addTactics', () => {
      it('should storage addTactics', (done) => {
        agent
            .post('/storage/addTactics')
            .send({
              name: 'test',
              source: {
                _id: pathId,
                name: 'test',
                type: '1',
              },
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              tacticsId = res.body.data;
              done();
            });
      });
    });

    describe('POST /storage/updateTactics', () => {
      it('should storage updateTactics', (done) => {
        agent
            .post('/storage/updateTactics')
            .send({
              _id: tacticsId,
              name: 'test',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/enableTactics', () => {
      it('should storage enableTactics', (done) => {
        agent
            .post('/storage/enableTactics')
            .send({
              _id: tacticsId,
              status: '0',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    describe('GET /storage/getTacticsDetail', () => {
      it('should storage getTacticsDetail', (done) => {
        agent
            .get('/storage/getTacticsDetail')
            .query({ _id: tacticsId })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /storage/listTactics', () => {
      it('should storage listTactics', (done) => {
        agent
            .get('/storage/listTactics')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/deleteTactics', () => {
      it('should storage deleteTactics', (done) => {
        agent
            .post('/storage/deleteTactics')
            .send({
              _id: tacticsId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/deletePath', () => {
      it('should storage deletePath', (done) => {
        agent
            .post('/storage/deletePath')
            .send({
              _id: pathId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /storage/deleteBucket', () => {
      it('should storage deleteBucket', (done) => {
        agent
            .post('/storage/deleteBucket')
            .send({
              _id: bucketId,
            })
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

