/**
 * Created by steven on 17/5/8.
 */
const should = require('should');
const assert = require('assert');
const request = require('supertest');
const config = require("../../config");
const mongodb = require('mongodb');

describe('role', function() {
  var url = config.domain;
  var userCookie = '';
  var userIds = '';
  var userInfo = ""
  var roleInfo = "";

  before(function (done) {
    mongodb.MongoClient.connect(config.mongodb.url, function(err, db) {
      if (err) {
        console.log(err);
        done();
      }
      userInfo = db.collection('UserInfo');
      roleInfo = db.collection('RoleInfo');
      userInfo.findOne({"_id": "xuyawen@phoenixtv.com"}, function (err, doc) {
        if (err) {
          console.log(err);
          done();
        }
        userIds = doc._id;
        done();
      })
    })
  });

  describe('#login', function () {
    it('/user/login', function (done) {
      request(url)
        .post('/api/user/login')
        .send({username: "xuyawen", password: "123123"})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
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

  describe('#list', function () {
    it('/role/list', function (done) {
      request(url)
        .get('/api/role/list')
        .set('Cookie', userCookie)
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  var _roleId = '';
  describe('#add', function () {
    it('/role/add', function (done) {
      request(url)
        .post('/api/role/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({'name': 'test', 'permissions': '/api/role/list'})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          roleInfo.findOne({name: 'test'}, function(err, doc){
            if(err){
              console.log(err);
              done();
            }
            _roleId = doc._id;
            done();
          })
        })
    });
  });

  describe('#getDetail', function () {
    it('/role/getDetail', function (done) {
      request(url)
        .get('/api/role/getDetail')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .query({"_id": _roleId})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  describe('#update', function () {
    it('/role/update', function (done) {
      request(url)
        .post('/api/role/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"_id": _roleId, "name": "test1", "permissions": "/api/role/list"})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  describe('#delete', function () {
    it('/role/delete', function (done) {
      request(url)
        .post('/api/role/delete')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"_ids": _roleId})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  describe('#listPermission', function () {
    it('/role/listPermission', function (done) {
      request(url)
        .get('/api/role/listPermission')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  describe('#assignRoleToUser', function () {
    it('/role/assignRoleToUser', function (done) {
      request(url)
        .post('/api/role/assignRoleToUser')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"userIds": userIds, "roles": "admin"})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        })
    });
  });

})