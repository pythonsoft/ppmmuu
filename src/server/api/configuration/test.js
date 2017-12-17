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
  describe('configuration', () => {
    const url = config.domain;
    const userCookie = '';
    let configurationInfo = '';
    let configurationGroupInfo = '';

    before((done) => {
      mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
        if (err) {
          console.log(err);
          done();
        }
        configurationInfo = db.collection('ConfigurationInfo');
        configurationGroupInfo = db.collection('ConfigurationGroupInfo');
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

    describe('#list', () => {
      it('/configuration/list', (done) => {
        agent
            .get('/configuration/list')
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

    let _id = '';
    describe('#add', () => {
      it('/configuration/add', (done) => {
        agent
            .post('/configuration/add')
            .send({
              key: 'testKeytest',
              value: 'testValue',
              genre: 'testGenre',
              description: 'A simple description',
            })
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied

              res.body.status.should.equal('0');
              configurationInfo.findOne({ key: 'testKeytest' }, (err, doc) => {
                if (err) {
                  console.log(err);
                  done();
                }
                _id = doc._id;
                done();
              });
            });
      });
    });

    describe('#update', () => {
      it('/configuration/update', (done) => {
        agent
            .post('/configuration/update')
            .send({
              _id,
              key: 'testKeytest',
              value: 'testValue',
              genre: 'testGenre',
              description: 'A simple description',
            })
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

    describe('#delete', () => {
      it('/configuration/delete', (done) => {
        agent
            .post('/configuration/delete')
            .send({
              _id,
            })
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

    let groupId = '';
    describe('#addGroup', () => {
      it('/configuration/addGroup', (done) => {
        agent
            .post('/configuration/addGroup')
            .send({
              name: 'testGroup',
              parent: '',
            })
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied

              res.body.status.should.equal('0');
              configurationGroupInfo.findOne({ name: 'testGroup' }, (err, doc) => {
                if (err) {
                  throw err;
                }

                groupId = doc._id;
                done();
              });
            });
      });
    });

    describe('#listGroup', () => {
      it('/configuration/listGroup', (done) => {
        agent
            .get('/configuration/listGroup')
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

    describe('#updateGroup', () => {
      it('/configuration/updateGroup', (done) => {
        agent
            .post('/configuration/updateGroup')
            .send({
              _id: groupId,
              name: 'testGroup1',
            })
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

    describe('#deleteGroup', () => {
      it('/configuration/deleteGroup', (done) => {
        agent
            .post('/configuration/deleteGroup')
            .send({
              _id: groupId,
            })
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
  });
  run();
}, 5000);
