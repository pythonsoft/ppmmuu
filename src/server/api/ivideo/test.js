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
const uuid = require('uuid');

setTimeout(() => {
  describe('/ivideo', () => {
    let itemInfoParentId = '';
    let itemInfo = null;
    let projectInfo = null;
    let projectInfoId = '';

    before((done) => {
      mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
        if (err) {
          console.log(err);
          done();
        }
        itemInfo = db.collection('MovieEditor_ItemInfo');
        projectInfo = db.collection('MovieEditor_ProjectInfo');
        done();
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

    describe('POST /ivideo/createItem', () => {
      it('should create item', (done) => {
        agent
            .post('/ivideo/createItem')
            .send({
              parentId: '',
              name: 'testst',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              itemInfo.findOne({ name: 'testst' }, (err, doc) => {
                itemInfoParentId = doc ? doc._id : '';
                done();
              });
            });
      });
    });

    describe('GET /ivideo/init', () => {
      it('should ivideo init', (done) => {
        agent
            .get('/ivideo/init')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /ivideo/listItem', () => {
      it('should ivideo listItem', (done) => {
        agent
            .get('/ivideo/listItem')
            .query({ parentId: itemInfoParentId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              if (itemInfoParentId) {
                expect(res.body.status).to.equal('0');
              } else {
                res.body.status.should.not.equal('0');
              }
              done();
            });
      });
    });

    describe('GET /ivideo/createDirectory', () => {
      it('should createDirectory', (done) => {
        agent
            .post('/ivideo/createDirectory')
            .send({ parentId: itemInfoParentId, name: 'testtest' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              itemInfo.remove({ parentId: itemInfoParentId, name: 'testtest', type: '0' }, (err, doc) => {
                done();
              });
            });
      });
    });

    let createItemId = '';
    describe('POST /ivideo/createItem', () => {
      it('should create item', (done) => {
        agent
            .post('/ivideo/createItem')
            .send({
              parentId: itemInfoParentId,
              name: 'testtest',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              itemInfo.findOne({ parentId: itemInfoParentId, name: 'testtest' }, (err, doc) => {
                createItemId = doc ? doc._id : '';
                done();
              });
            });
      });
    });

    describe('POST /ivideo/updateItem', () => {
      it('should updateItem', (done) => {
        agent
            .post('/ivideo/updateItem')
            .send({
              id: createItemId,
              name: 'testtest',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /ivideo/removeItem', () => {
      it('should remove item', (done) => {
        agent
            .post('/ivideo/removeItem')
            .send({
              id: createItemId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /ivideo/removeItem', () => {
      it('should remove item', (done) => {
        agent
            .post('/ivideo/removeItem')
            .send({
              id: itemInfoParentId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /ivideo/createProject', () => {
      it('should createProject', (done) => {
        agent
            .post('/ivideo/createProject')
            .send({
              name: 'test_project',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              projectInfo.findOne({ name: 'test_project' }, (err, doc) => {
                projectInfoId = doc ? doc._id : '';
              });
              done();
            });
      });
    });

    describe('POST /ivideo/listProject', () => {
      it('should listProject', (done) => {
        agent
            .get('/ivideo/listProject')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /ivideo/removeProject', () => {
      it('should removeProject', (done) => {
        agent
            .post('/ivideo/removeProject')
            .send({
              id: projectInfoId,
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

