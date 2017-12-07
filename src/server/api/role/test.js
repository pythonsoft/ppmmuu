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

describe('role', () => {
  let userIds = '';
  let adminRoleId = '';
  let userInfo = '';
  let roleInfo = '';

  before((done) => {
    mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
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
          adminRoleId = doc ? doc._id : '';
          done();
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
    it('/role/list', (done) => {
      agent
        .get('/role/list')
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
      agent
        .post('/role/add')
        .send({ name: 'test', allowedPermissions: ['/role/list'], _id: 'test' })
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
      agent
        .get('/role/getDetail')
        .query({ _id: _roleId })
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
      agent
        .post('/role/update')
        .send({ _id: _roleId, name: 'test' })
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
      agent
        .post('/role/delete')
        .send({ _ids: _roleId })
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
      agent
        .get('/role/listPermission')
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
      agent
        .post('/role/assignRole')
        .send({ _id: userIds, roles: adminRoleId, type: '3' })
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
            expect(res).to.have.header('set-cookie');
            done();
          });
    });
  });

  describe('#getRoleOwners', () => {
    it('/role/getRoleOwners', (done) => {
      agent
        .get('/role/getRoleOwners')
        .query({ _id: adminRoleId })
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
    it('/role/deleteOwnerRole', (done) => {
      agent
        .post('/role/deleteOwnerRole')
        .send({ _id: userIds, roles: 'guest' })
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
            expect(res).to.have.header('set-cookie');
            done();
          });
    });
  });

  describe('#updateRoleAddPermission', () => {
    it('/role/updateRoleAddPermission', (done) => {
      agent
        .post('/role/updateRoleAddPermission')
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
            expect(res).to.have.header('set-cookie');
            done();
          });
    });
  });


  describe('#updateRoleDeletePermission', () => {
    it('/role/updateRoleDeletePermission', (done) => {
      agent
        .post('/role/updateRoleDeletePermission')
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
            expect(res).to.have.header('set-cookie');
            done();
          });
    });
  });

  describe('#enablePermission', () => {
    it('/role/enablePermission', (done) => {
      agent
          .post('/role/enablePermission')
          .send({
            paths: '/role/list,/role/update',
            status: '0',
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
            expect(res).to.have.header('set-cookie');
            done();
          });
    });
  });


  describe('#userOrGroup', () => {
    it('/role/search/userOrGroup', (done) => {
      agent
          .get('/role/search/userOrGroup')
          .query({ type: '0', keyword: 'x' })
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

  describe('#listPermissionGroup', () => {
    it('/role/listPermissionGroup', (done) => {
      agent
          .get('/role/listPermissionGroup')
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
