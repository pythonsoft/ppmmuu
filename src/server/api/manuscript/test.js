/**
 * Created by steven on 17/5/8.
 */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = require('should');
const path = require('path');
const fs = require('fs');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);
const config = require('../../config');
const mongodb = require('mongodb');
const uuid = require('uuid');

setTimeout(() => {
  let userIds = '';
  let userInfo = '';
  let groupInfo = '';
  const parentId = 'fhws';
  const groupId = '';
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

  describe('manuscript', () => {
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

    let _id = '';
    describe('#add', () => {
      it('/manuscript/addOrUpdate', (done) => {
        agent
            .post('/manuscript/addOrUpdate')
            .send({
              title: '标题',
              content: '正文',
              viceTitle: '副标题',
              collaborators: [
                { _id: 'b9e77160-da6e-11e7-9ab4-f3602b15a057', name: 'xuyawen' },
              ],
              editContent: [
                {
                  tag: '2',
                  content: '这是内容1',
                },
                {
                  tag: '3',
                  content: '这是内容2',
                },
                {
                  tag: '4',
                  content: '这是内容3',
                },
              ],
            })
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied
              res.body.status.should.equal('0');
              _id = res.body.data;
              done();
            });
      });
    });

    describe('#getTagsConfig', () => {
      it('/manuscript/getTagsConfig', (done) => {
        agent
            .get('/manuscript/getTagsConfig')
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

    describe('#getManuscriptConfig', () => {
      it('/manuscript/getManuscriptConfig', (done) => {
        agent
            .get('/manuscript/getManuscriptConfig')
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

    describe('#listManuscript', () => {
      it('/manuscript/list', (done) => {
        agent
            .get('/manuscript/list')
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

    describe('#getManuscript', () => {
      it('/manuscript/getManuscript', (done) => {
        agent
            .get('/manuscript/getManuscript')
            .query({ _id })
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


    const filePath = path.join(__dirname, 'index.js');
    const attachments = [];
    let attachId = '';
    describe('#addAttachment', () => {
      it('/manuscript/addAttachment', (done) => {
        agent
            .post('/manuscript/addAttachment')
            .attach('file', fs.readFileSync(filePath), 'index.js')
            .end((err, res) => {
              if (err) {
                throw err;
              }
              // Should.js fluent syntax applied
              res.body.status.should.equal('0');
              attachId = res.body.data._id;
              attachments.push(res.body.data);
              done();
            });
      });
    });

    describe('#updateManuscript', () => {
      it('/manuscript/addOrUpdate', (done) => {
        agent
            .post('/manuscript/addOrUpdate')
            .send({
              _id,
              title: '标题1',
              content: '正文1',
              viceTitle: '副标题1',
              collaborators: [
                "{'_id': 'b9e77160-da6e-11e7-9ab4-f3602b15a057', name: 'xuyawen2'}",
              ],
              attachments,
              editContent: [
                {
                  tag: '2',
                  content: '这是内容3',
                },
                {
                  tag: '3',
                  content: '这是内容4',
                },
                {
                  tag: '4',
                  content: '这是内容5',
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

    describe('#changeManuscriptStatus', () => {
      it('/manuscript/changeManuscriptStatus', (done) => {
        agent
            .post('/manuscript/changeManuscriptStatus')
            .send({
              _ids: _id,
              status: '2',
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

    describe('#listAttachments', () => {
      it('/manuscript/listAttachments', (done) => {
        agent
            .get('/manuscript/listAttachments')
            .query({
              manuscriptId: _id,
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


    describe('#deleteAttachments', () => {
      it('/manuscript/deleteAttachments', (done) => {
        agent
            .post('/manuscript/deleteAttachments')
            .send({
              _ids: attachId,
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

    describe('#changeManuscriptStatus', () => {
      it('/manuscript/changeManuscriptStatus', (done) => {
        agent
            .post('/manuscript/changeManuscriptStatus')
            .send({
              _ids: _id,
              status: '4',
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

    describe('#hongKongSimplified', () => {
      it('/manuscript/hongKongSimplified', (done) => {
        agent
            .post('/manuscript/hongKongSimplified')
            .send({
              conversionType: '1',
              title: '你好啊，我是简体呢',
              content: '我很好，你说明天会发生什么',
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

  describe('#listGroup', () => {
    it('/manuscript/listGroup', (done) => {
      agent
          .get('/manuscript/listGroup')
          .query({
            type: '0',
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

  describe('#listUser', () => {
    it('/manuscript/listUser', (done) => {
      agent
          .get('/manuscript/listUser')
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

  run();
}, 5000);
