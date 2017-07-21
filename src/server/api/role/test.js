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
  let adminRoleId = '';
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
      userInfo.findOne({ email: 'xuyawen@phoenixtv.com' }, (err, doc) => {
        if (err) {
          console.log(err);
          done();
        }
        userIds = doc._id;

        roleInfo.findOne({ name: 'admin' }, (err, doc) => {
          if (err) {
            console.log(err);
            done();
          }
          adminRoleId = doc._id;
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
    it('/role/list', (done) => {
      request(url)
        .get('/role/list')
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
        .post('/role/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ name: 'test', allowedPermissions: ['/role/list'], _id: 'test' })
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
        .get('/role/getDetail')
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
        .post('/role/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: _roleId, name: 'test' })
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
        .post('/role/delete')
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
        .get('/role/listPermission')
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
        .post('/role/assignRole')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: userIds, roles: adminRoleId, type: '3' })
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

  describe('#getRoleOwners', () => {
    it('/role/getRoleOwners', (done) => {
      request(url)
        .get('/role/getRoleOwners')
        .set('Cookie', userCookie)
        .query({ _id: adminRoleId })
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

  describe('#deleteOwnerRole', () => {
    it('/role/delete', (done) => {
      request(url)
        .post('/role/deleteOwnerRole')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: userIds, roles: "guest" })
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

  describe('#updateRoleAddPermission', () => {
    it('/role/updateRoleAddPermission', (done) => {
      request(url)
        .post('/role/updateRoleAddPermission')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: adminRoleId,
          allowedPermissions: [
            '/role/list',
            '/role/getDetail',
            'all',
          ],
          deniedPermissions: [
            '/role/ ',
            '/role/update',
          ],
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


  describe('#updateRoleDeletePermission', () => {
    it('/role/updateRoleDeletePermission', (done) => {
      request(url)
        .post('/role/updateRoleDeletePermission')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({ _id: adminRoleId,
          allowedPermissions: [
            '/role/list',
            '/role/getDetail',
          ],
          deniedPermissions: [
            '/role/ ',
            '/role/update',
          ],
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
