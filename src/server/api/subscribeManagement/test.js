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

setTimeout(() => {
  describe('/subscribeManagement', () => {
    before((done) => {
      done();
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

    const subscribeId = '73989120-bd19-11e7-938c-b1f9b52453ab';
    describe('POST /subscribeManagement/create', () => {
      it('should subscribeManagement create', (done) => {
        agent
            .post('/subscribeManagement/create')
            .send({
              _id: subscribeId,
              companyName: 'jk',
              subscribeType: ['娱乐'],
              downloadSeconds: '12',
              periodOfUse: 6,
              startTime: '2017-12-07T06:09:58.847Z',
              autoPush: true,
              transcodeTemplateSelector: '',
              transcodeTemplates: [],
              transcodeTemplateDetail: { transcodeTemplates: [], transcodeTemplateSelector: '' },
            },
            )
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /subscribeManagement/update', () => {
      it('should subscribeManagement update', (done) => {
        agent
            .post('/subscribeManagement/update')
            .send({
              _id: subscribeId,
              companyName: 'jk',
              subscribeType: ['娱乐'],
              downloadSeconds: '12',
              periodOfUse: 6,
              startTime: '2017-12-07T06:09:58.847Z',
              autoPush: true,
              transcodeTemplateSelector: '',
              transcodeTemplates: [],
              transcodeTemplateDetail: { transcodeTemplates: [], transcodeTemplateSelector: '' },
            },
            )
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribeManagement/getSubscribeInfo', () => {
      it('should subscribeManagement getSubscribeInfo', (done) => {
        agent
            .get('/subscribeManagement/getSubscribeInfo')
            .query({ _id: subscribeId })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribeManagement/list', () => {
      it('should subscribeManagement list', (done) => {
        agent
            .get('/subscribeManagement/list')
            .query({ _id: subscribeId })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    describe('POST /subscribeManagement/delete', () => {
      it('should subscribeManagement delete', (done) => {
        agent
            .post('/subscribeManagement/delete')
            .send({
              _ids: subscribeId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribeManagement/searchCompany', () => {
      it('should subscribeManagement searchCompany', (done) => {
        agent
            .get('/subscribeManagement/searchCompany')
            .query({ keyword: 'x' })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });


    let subscribeTypeId = '';
    describe('POST /subscribeManagement/createSubscribeType', () => {
      it('should subscribeManagement createSubscribeType', (done) => {
        agent
            .post('/subscribeManagement/createSubscribeType')
            .send({
              name: 'test',
              photo: 'asfa',
              description: '',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              subscribeTypeId = res.body.data;
              done();
            });
      });
    });

    describe('POST /subscribeManagement/updateSubscribeType', () => {
      it('should subscribeManagement updateSubscribeType', (done) => {
        agent
            .post('/subscribeManagement/updateSubscribeType')
            .send({
              _id: subscribeTypeId,
              name: 'test',
              photo: 'asfa',
              description: '',
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribeManagement/getSubscribeType', () => {
      it('should subscribeManagement getSubscribeType', (done) => {
        agent
            .get('/subscribeManagement/getSubscribeType')
            .query({ _id: subscribeTypeId })
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /subscribeManagement/listSubscribeType', () => {
      it('should subscribeManagement listSubscribeType', (done) => {
        agent
            .get('/subscribeManagement/listSubscribeType')
            .end((err, res) => {
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /subscribeManagement/deleteSubscribeType', () => {
      it('should subscribeManagement deleteSubscribeType', (done) => {
        agent
            .post('/subscribeManagement/deleteSubscribeType')
            .send({
              _ids: subscribeId,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });
  });

  run();
}, 5000);

