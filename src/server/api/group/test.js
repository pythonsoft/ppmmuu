/**
 * Created by steven on 17/5/8.
 */
const should = require('should');
const assert = require('assert');
const request = require('supertest');
const config = require("../../config");
const mongodb = require('mongodb');

describe('group', function() {
  var url = config.domain;
  var userCookie = '';
  var userIds = '';
  var userInfo = ""
  var roleInfo = "";
  var groupInfo = "";
  var parentId = "";
  var groupId = "";

  before(function (done) {
    mongodb.MongoClient.connect(config.mongodb.umpURL, function(err, db) {
      if (err) {
        console.log(err);
        done();
      }
      userInfo = db.collection('UserInfo');
      roleInfo = db.collection('RoleInfo');
      groupInfo = db.collection("GroupInfo");
      userInfo.findOne({"_id": "xuyawen@phoenixtv.com"}, function (err, doc) {
        if (err) {
          console.log(err);
          done();
        }
        userIds = doc._id;
        groupInfo.findOne({"name": "中国凤凰卫视", parentId: ""}, function(err, doc){
          if (err) {
            console.log(err);
            done();
          }
          if(!doc){
            throw new Error("请先创建(中国凤凰卫视)这个公司")
          }
          parentId = doc._id;
          done();
        })
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
    it('/group/list', function (done) {
      request(url)
        .get('/api/group/list')
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

  describe('#add', function () {
    it('/group/add', function (done) {
      request(url)
        .post('/api/group/add')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"name": "信息部", "type": "1", parentId: parentId, deleteDeny: "0"})
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          groupInfo.findOne({"name": "信息部", "type": "1", parentId: parentId}, function(err, doc) {
            if(err){
              console.log(err);
              done();
            }
            groupId = doc._id;
            done();
          });
        })
    });
  });

  describe('#update', function () {
    it('/group/update', function (done) {
      request(url)
        .post('/api/group/update')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({"name": "宣传部", "type": "1", "_id": groupId})
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

  describe('#getDetail', function () {
    it('/group/getDetail', function (done) {
      request(url)
        .get('/api/group/getDetail')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .query({"_id": groupId})
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

  describe('#listAllChildGroup', function () {
    it('/group/listAllChildGroup', function (done) {
      request(url)
        .get('/api/group/listAllChildGroup')
        .set('Cookie', userCookie)
        .query({'_id': parentId})
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
    it('/group/delete', function (done) {
      request(url)
        .post('/api/group/delete')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({_id: groupId})
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

  describe('#userDetail', function () {
    it('/group/userDetail', function (done) {
      request(url)
        .get('/api/group/userDetail')
        .set('Cookie', userCookie)
        .query({'_id': userIds})
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

  describe('#addUser', function () {
    it('/group/addUser', function (done) {
      request(url)
        .post('/api/group/addUser')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          "email": "test@phoenixtv.com",
          "name": "测试",
          "phone": "13788768854",
          "displayName": "test",
          "password":"123456",
          "companyId": parentId
        })
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          console.log(res.body);
          res.body.status.should.equal('0');
          done();
        })
    });
  });

  describe('#updateUser', function () {
    it('/group/updateUser', function (done) {
      request(url)
        .post('/api/group/updateUser')
        .set('Cookie', userCookie)
        .set('Content-Type', 'application/json;charset=utf-8')
        .send({
          "_id": "test@phoenixtv.com",
          "name": "测试1",
          "displayName": "test1"
        })
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          userInfo.deleteOne({_id: "test@phoenixtv.com"}, function(err, r){
            if (err) {
              throw err;
            }
            done();
          })
        })
    });
  });

})