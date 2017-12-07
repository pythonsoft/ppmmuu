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

describe('group', () => {
  let userIds = '';
  let userInfo = '';
  let groupInfo = '';
  const parentId = 'fhws';
  let groupId = '';
  const departmentId = 'xcb';

  before((done) => {
    mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
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
        groupInfo.insertOne({
          _id: parentId,
          name: 'fhws',
          logo: 'http://localhost:8080/uploads/baa8fb5a1fb9567ba2b054c3fb23080e',
          creator: {
            _id: 'xuyawen@phoenixtv.com',
            name: 'xuyawen',
          },
          parentId: '',
          contact: {
            _id: 'asfasf',
            name: 'xuyawen',
            phone: '18719058667',
            email: 'asfasf@qq.com',
          },
          memberCount: 50,
          ad: '',
          type: '0',
          createdTime: '2017-07-04T03:44:47.787Z',
          modifyTime: '2017-07-04T03:44:47.787Z',
          description: '',
          deleteDeny: '1',
          detail: {},
          t: 1510314404064.0,
          mediaExpressUser: {
            username: '',
            password: '',
            userType: '',
            companyName: '',
            email: '',
          },
        }, () => {
          groupInfo.insertOne({
            _id: departmentId,
            name: '宣传部',
            logo: '',
            creator: {
              _id: 'xuyawen@phoenixtv.com',
              name: 'xuyawen',
            },
            parentId,
            contact: {
              name: '',
              phone: '',
              email: '',
            },
            memberCount: 0,
            ad: '',
            type: '1',
            createdTime: '2017-07-04T06:36:44.472Z',
            modifyTime: '2017-07-04T06:36:55.498Z',
            description: '',
            deleteDeny: '0',
            detail: {},
            t: 1509100084234.0,
          }, () => {
            done();
          });
        });
      });
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
    it('/group/list', (done) => {
      agent
        .get('/group/list')
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
      agent
        .post('/group/add')
        .send({ name: '信息部', type: '1', parentId, deleteDeny: '0' })
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

  describe('#getDetail', () => {
    it('/group/getDetail', (done) => {
      agent
        .get('/group/getDetail')
        .query({ _id: groupId })
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
      agent
        .post('/group/delete')
        .send({ _id: groupId })
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
      agent
        .get('/group/userDetail')
        .query({ _id: userIds })
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
      agent
        .post('/group/addUser')
        .send({
          email: 'test@phoenixtv.com',
          name: '测试',
          phone: '13788768854',
          displayName: 'test',
          password: '123456',
          companyId: parentId,
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

  describe('#updateUser', () => {
    it('/group/updateUser', (done) => {
      agent
        .post('/group/updateUser')
        .send({
          _id: 'test@phoenixtv.com',
          name: '测试1',
          displayName: 'test1',
        })
        .end((err, res) => {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          userInfo.deleteOne({ email: 'test@phoenixtv.com' }, (err) => {
            if (err) {
              throw err;
            }
            done();
          });
        });
    });
  });

  describe('#listUser', () => {
    it('/group/listUser', (done) => {
      agent
        .get('/group/listUser')
        .query({ _id: parentId, type: '0' })
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

  describe('#justifyUserGroup', () => {
    it('/group/justifyUserGroup', (done) => {
      agent
        .post('/group/justifyUserGroup')
        .send({
          _ids: userIds,
          departmentId,
          teamId: '',
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

  describe('#enableUser', () => {
    it('/group/enableUser', (done) => {
      agent
        .post('/group/enableUser')
        .send({
          _ids: userIds,
          status: '1',
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

  describe('#updateOwnerPermission', () => {
    it('/group/updateOwnerPermission', (done) => {
      agent
        .post('/group/updateOwnerPermission')
        .send({
          _id: userIds,
          type: '3',
          roles: [{ _id: 'admin' }],
          permissions: [
            {
              path: '/role/list',
              action: '允许',
            },
          ],
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

  describe('#updateGroupInfo', () => {
    it('/group/updateGroupInfo', (done) => {
      agent
        .post('/group/updateGroupInfo')
        .send({
          _id: parentId,
          name: 'fhws',
          memberCount: 50,
          contact: {
            _id: 'asfasf',
            name: 'xuyawen',
            phone: '18719058667',
            email: 'asfasf@qq.com',
          },
          deleteDeny: '1',
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

  describe('#getOwnerPermission', () => {
    it('/group/getOwnerPermission', (done) => {
      agent
        .get('/group/getOwnerPermission')
        .query({ _id: userIds })
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

  describe('#getOwnerEffectivePermission', () => {
    it('/group/getOwnerEffectivePermission', (done) => {
      agent
        .get('/group/getOwnerEffectivePermission')
        .query({ _id: userIds, type: '3' })
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

  describe('#searchUser', () => {
    it('/group/searchUser', (done) => {
      agent
        .get('/group/searchUser')
        .query({ companyId: parentId })
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

  describe('#bindMediaExpressUser', () => {
    it('/group/bindMediaExpressUser', (done) => {
      agent
          .post('/group/bindMediaExpressUser')
          .send({ _id: userIds, username: 'quxiaoguo@phoenixtv.com', password: 'ifeng2016' })
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
