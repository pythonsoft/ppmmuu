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

describe('/audit', () => {
  const auditId = uuid.v1();
  let auditInfo = null;
  let auditRuleInfo = null;

  before((done) => {
    mongodb.MongoClient.connect('mongodb://10.0.15.62:27017/ump_test', (err, db) => {
      if (err) {
        console.log(err);
        done();
      }
      auditInfo = db.collection('audit_auditInfo');
      auditRuleInfo = db.collection('audit_ruleInfo');
      auditInfo.insertOne({
        _id: auditId,
        name: 'CH100001231_38CAD946-B85B-476C-BD5A-1012F6AED6FE.mxf',
        createTime: new Date(),
        lastModify: new Date(),
        status: '1',
        type: '1',
        applicant: {
          _id: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
          name: 'xuyawen',
          companyId: '28767af0-606b-11e7-9066-d9d30fbb84c0',
          companyName: 'fenghuang',
          departmentName: '小部门',
          departmentId: '3f4c3ad0-baca-11e7-86de-9b53c2c58dbd',
        },
        verifier: {
          _id: '',
          name: '',
          companyId: '',
          companyName: '',
          departmentName: '',
          departmentId: '',
        },
        ownerDepartment: {
          _id: '2c189400-6083-11e7-80d5-61ac588ddf98',
          name: '宣传部',
        },
        message: '',
        description: '',
        detail: {
          objectid: 'F20F8EB7-ABA2-4708-A54F-468EE5D35C82',
          inpoint: 0,
          outpoint: 0,
          filename: 'CH100001231_38CAD946-B85B-476C-BD5A-1012F6AED6FE.mxf',
          filetypeid: '040130E8-9C84-4D0B-B181-AC5B9D523EF0',
          templateId: 'FF',
          source: 1,
          t: 1511933600375.0,
          userInfo: {
            _id: 'd5bb8820-9385-11e7-8346-79c9253a3aed',
            name: 'xuyawen',
            displayName: 'steven',
            title: '',
            verifyType: '0',
            company: {
              _id: '28767af0-606b-11e7-9066-d9d30fbb84c0',
              name: 'fenghuang',
            },
            department: {
              _id: '3f4c3ad0-baca-11e7-86de-9b53c2c58dbd',
              name: '小部门',
            },
            team: {
              _id: '',
              name: '',
            },
            createdTime: '2017-09-07T04:34:28.387Z',
            description: '',
            employeeId: '',
            email: 'xuyawen@phoenixtv.com',
            phone: '18719058667',
            photo: 'http://localhost:8080/uploads/2017中華小姐環球大賽 90來啦00-00-00-00-1510914199789.png',
            status: '1',
            mediaExpressUser: {
              password: 'ifeng2016',
              username: 'quxiaoguo@phoenixtv.com',
            },
          },
          ownerName: '頻道編播部',
        },
      }, (err) => {
        if (err) {
          console.log(err);
          done();
        }
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

  describe('GET /audit/list', () => {
    it('should list audit', (done) => {
      agent
          .get('/audit/list')
          .query({ keyword: 'x', pageSize: 5 })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            res.body.data.docs.length.should.lessThanOrEqual(5);
            done();
          });
    });
  });

  describe('POST /audit/pass', () => {
    it('should pass', (done) => {
      agent
          .post('/audit/pass')
          .send({ ids: auditId })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            auditInfo.remove({ _id: auditId }, (err, doc) => {
              done();
            });
          });
    });
  });

  describe('GET /audit/listAuditRule', () => {
    it('should list auditRule', (done) => {
      agent
          .get('/audit/listAuditRule')
          .query({ pageSize: 5 })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            res.body.data.docs.length.should.lessThanOrEqual(5);
            done();
          });
    });
  });

  let auditRuleId = '';
  describe('POST /audit/createAuditRule', () => {
    it('should create auditRule', (done) => {
      agent
          .post('/audit/createAuditRule')
          .send({
            ownerName: 'testtest',
            permissionType: '2',
            auditDepartment: { _id: 'test', name: 'test' },
            whitelist: '',
            description: '',
            detail: {},
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            auditRuleInfo.findOne({ ownerName: 'testtest' }, (err, doc) => {
              auditRuleId = doc ? doc._id : '';
              done();
            });
          });
    });
  });

  describe('POST /audit/updateAuditRule', () => {
    it('should updateAuditRule', (done) => {
      agent
          .post('/audit/updateAuditRule')
          .send({
            _id: auditRuleId,
            ownerName: 'testtest',
            auditDepartment: { _id: 'test', name: 'test' },
            whitelist: '',
            description: '',
            detail: {},
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });

  describe('POST /audit/removeAuditRule', () => {
    it('should remove audit rule', (done) => {
      agent
          .post('/audit/removeAuditRule')
          .send({ ids: auditRuleId })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equal('0');
            done();
          });
    });
  });
});

