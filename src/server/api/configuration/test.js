/**
 * Created by steven on 17/5/8.
 */

'use strict';

/* eslint-disable */
const should = require('should');
const assert = require('assert');
/* eslint-enable */
const request = require('supertest');
const config = require('../../config');
const mongodb = require('mongodb');

describe('configuration', () => {
  const url = config.domain;
  let userCookie = '';
  let configurationInfo = '';
  let configurationGroupInfo = '';

  before((done) => {
    mongodb.MongoClient.connect(config.mongodb.umpURL, (err, db) => {
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
      request(url)
        .post('/user/login')
        .send({ username: 'xuyawen', password: '123123' })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          userCookie = res.headers['set-cookie'];
          done();
        });
    });
  });

  describe('#list', () => {
    it('/configuration/list', (done) => {
      request(url)
        .get('/configuration/list')
        .set('Cookie', userCookie)
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .post('/configuration/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          key: 'testKey',
          value: 'testValue',
          genre: 'testGenre',
          description: 'A simple description',
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied

          res.body.status.should.equal('0');
          configurationInfo.findOne({ key: 'testKey' }, (err, doc) => {
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
      request(url)
        .post('/configuration/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          _id,
          key: 'testKey',
          value: 'testValue',
          genre: 'testGenre',
          description: 'A simple description',
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .post('/configuration/delete')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          _id,
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .post('/configuration/addGroup')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          name: 'testGroup',
          parent: '',
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .get('/configuration/listGroup')
        .set('Cookie', userCookie)
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .post('/configuration/updateGroup')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          _id: groupId,
          name: 'testGroup1',
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
      request(url)
        .post('/configuration/deleteGroup')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          _id: groupId,
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
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
