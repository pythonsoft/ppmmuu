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
  describe('/media', () => {
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

    describe('POST /media/esSearch', () => {
      it('should media esSearch', (done) => {
        agent
            .post('/media/esSearch')
            .send({
              source: 'id,duration,name,ccid,program_type,program_name_en,hd_flag,program_name_cn,last_modify,content_introduction,content,news_data,program_name,from_where,full_text,publish_time,rootid',
              match: [{ key: 'program_type', value: [] }, { key: 'ccid', value: [] }, {
                key: 'news_type',
                value: [],
              }, { key: 'occur_country', value: [] }, { key: 'versions', value: [] }, {
                key: 'production_site',
                value: [],
              }, { key: 'resource_location', value: [] }, { key: 'publish_status', value: 1 }],
              should: [],
              range: [{ key: 'news_data', gte: '', lt: '' }, { key: 'airdata', gte: '', lt: '' }],
              hl: 'name,program_name_en,program_name_cn,content,content_introduction,house_num,from_where,full_text',
              sort: [{ key: 'publish_time', value: 'desc' }],
              start: 0,
              pageSize: 20,
              t: 1512472442646,
            })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /media/getEsMediaList', () => {
      it('should media getEsMediaList', (done) => {
        agent
            .get('/media/getEsMediaList')
            .query({ pageSize: 4 })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              const rs = res.body.data;
              for (const key in rs) {
                rs[key].docs.length.should.lessThanOrEqual(4);
              }
              done();
            });
      });
    });

    describe('GET /media/defaultMedia', () => {
      it('should media defaultMedia', (done) => {
        agent
            .get('/media/defaultMedia')
            .query({ size: 4 })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              const rs = res.body.data;
              for (const key in rs) {
                rs[key].docs.length.should.lessThanOrEqual(4);
              }
              done();
            });
      });
    });

    describe('GET /media/getSearchConfig', () => {
      it('should media getSearchConfig', (done) => {
        agent
            .get('/media/getSearchConfig')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    const objectId = '53D7705C-DB29-4509-9A51-15D0A2298205';

    describe('GET /media/getIcon', () => {
      it('should media getIcon', (done) => {
        agent
            .get('/media/getIcon')
            .query({ objectid: objectId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              done();
            });
      });
    });

    describe('GET /media/getObject', () => {
      it('should media getObject', (done) => {
        agent
            .get('/media/getObject')
            .query({ objectid: objectId })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /media/getStream', () => {
      it('should media getStream', (done) => {
        agent
            .get('/media/getStream')
            .query({ objectid: objectId, fromWhere: 'MAM' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /media/getSearchHistory', () => {
      it('should media getSearchHistory', (done) => {
        agent
            .get('/media/getSearchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /media/getWatchHistory', () => {
      it('should media getWatchHistory', (done) => {
        agent
            .get('/media/getWatchHistory')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('GET /media/xml2srt', () => {
      it('should media xml2srt', (done) => {
        agent
            .get('/media/xml2srt')
            .query({ objectid: objectId })
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

