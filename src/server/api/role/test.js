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

describe('role', () => {
  const url = config.domain;
  let userCookie = '';
  let userIds = '';
  let userInfo = '';
  let roleInfo = '';

  before((done) => {
    mongodb.MongoClient.connect(config.mongodb.umpURL, (err, db) => {
      if (err) {
        console.log(err);
        done();
      }
      userInfo = db.collection('UserInfo');
      roleInfo = db.collection('RoleInfo');
      userInfo.findOne({ _id: 'xuyawen@phoenixtv.com' }, (err, doc) => {
        if (err) {
          console.log(err);
          done();
        }
        userIds = doc._id;
        done();
      });
    });
  });

  describe('#login', () => {
    it('/user/login', (done) => {
      request(url)
        .post('/api/user/login')
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
    it('/role/list', (done) => {
      request(url)
        .get('/api/role/list')
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

  let _roleId = '';
  describe('#add', () => {
    it('/role/add', (done) => {
      request(url)
        .post('/api/role/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ name: 'test', allowedPermissions: '/api/role/list' })
        .expect('Content-Type', /json/)
        .expect(200) // Status code
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied

          res.body.status.should.equal('0');
          roleInfo.findOne({ name: 'test' }, (err, doc) => {
            if (err) {
              console.log(err);
              done();
            }
            _roleId = doc._id;
            done();
          });
        });
    });
  });

  describe('#getDetail', () => {
    it('/role/getDetail', (done) => {
      request(url)
        .get('/api/role/getDetail')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .query({ _id: _roleId })
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

  describe('#update', () => {
    it('/role/update', (done) => {
      request(url)
        .post('/api/role/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: _roleId, name: 'test1', allowedPermissions: '/api/role/list' })
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
    it('/role/delete', (done) => {
      request(url)
        .post('/api/role/delete')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _ids: _roleId })
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

  describe('#listPermission', () => {
    it('/role/listPermission', (done) => {
      request(url)
        .get('/api/role/listPermission')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
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

  describe('#assignRole', () => {
    it('/role/assignRole', (done) => {
      request(url)
        .post('/api/role/assignRole')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: userIds, roles: 'admin' })
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

  describe('#getUserOrDepartmentRoleAndPermissions', () => {
    it('/role/getUserOrDepartmentRoleAndPermissions', (done) => {
      request(url)
        .get('/api/role/getUserOrDepartmentRoleAndPermissions')
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
});
