/**
 * Created by steven on 17/5/8.
 */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = require('should');
const fs = require('graceful-fs');
const path = require('path');

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app);

setTimeout(() => {
  describe('/upload', () => {
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

    const filePath = path.join(__dirname, 'index.js');

    describe('POST /upload', () => {
      it('should upload', (done) => {
        agent
            .post('/upload')
            .attach('file', fs.readFileSync(filePath), 'index.js')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.status).to.equal('0');
              done();
            });
      });
    });

    describe('POST /upload/uploadWatermark', () => {
      it('should upload uploadWatermark', (done) => {
        agent
            .post('/upload/uploadWatermark')
            .attach('file', fs.readFileSync(filePath), 'index.png')
            .end((err, res) => {
              const rs = JSON.parse(res.text);
              expect(res).to.have.status(200);
              expect(rs.status).to.equal('0');
              done();
            });
      });
    });
  });

  run();
}, 5000);

