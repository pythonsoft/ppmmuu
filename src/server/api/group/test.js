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

describe('group', () => {
  const url = config.domain;
  let userCookie = '';
  let userIds = '';
  let userInfo = '';
  let groupInfo = '';
  let parentId = '';
  let groupId = '';

  before((done) => {
    mongodb.MongoClient.connect(config.mongodb.umpURL, (err, db) => {
      if (err) {
        console.log(err);
        done();
      }
      userInfo = db.collection('UserInfo');
      groupInfo = db.collection('GroupInfo');
      userInfo.findOne({ email: 'xuyawen@phoenixtv.com' }, (err, doc) => {
        if (err) {
          console.log(err);
          done();
        }
        userIds = doc._id;
        groupInfo.findOne({ name: '中国凤凰卫视', parentId: '' }, (err, doc) => {
          if (err) {
            console.log(err);
            done();
          }
          if (!doc) {
            throw new Error('请先创建(中国凤凰卫视)这个公司');
          }
          parentId = doc._id;
          done();
        });
      });
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
    it('/group/list', (done) => {
      request(url)
        .get('/group/list')
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

  describe('#add', () => {
    it('/group/add', (done) => {
      request(url)
        .post('/group/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ name: '信息部', type: '1', parentId, deleteDeny: '0' })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          groupInfo.findOne({ name: '信息部', type: '1', parentId }, (err, doc) => {
            if (err) {
              console.log(err);
              done();
            }
            groupId = doc._id;
            done();
          });
        });
    });
  });

  describe('#update', () => {
    it('/group/update', (done) => {
      request(url)
        .post('/group/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ name: '宣传部test', type: '1', _id: groupId })
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

  describe('#getDetail', () => {
    it('/group/getDetail', (done) => {
      request(url)
        .get('/group/getDetail')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .query({ _id: groupId })
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
    it('/group/delete', (done) => {
      request(url)
        .post('/group/delete')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: groupId })
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

  describe('#userDetail', () => {
    it('/group/userDetail', (done) => {
      request(url)
        .get('/group/userDetail')
        .set('Cookie', userCookie)
        .query({ _id: userIds })
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

  describe('#addUser', () => {
    it('/group/addUser', (done) => {
      request(url)
        .post('/group/addUser')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          email: 'test@phoenixtv.com',
          name: '测试',
          phone: '13788768854',
          displayName: 'test',
          password: '123456',
          companyId: parentId,
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

  describe('#updateUser', () => {
    it('/group/updateUser', (done) => {
      request(url)
        .post('/group/updateUser')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          _id: 'test@phoenixtv.com',
          name: '测试1',
          displayName: 'test1',
        })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          userInfo.deleteOne({ _id: 'test@phoenixtv.com' }, (err) => {
            if (err) {
              throw err;
            }
            done();
          });
        });
    });
  });
});
