/**
 * Created by steven on 17/5/8.
 */
const should = require('should');
const assert = require('assert');
const request = require('supertest');
const config = require("../../config");

describe('log', function() {
  var url = config.domain;
  var userCookie = '';

  before(function (done) {
    done();
  });

  describe('#test', function () {
    it('/log/test', function (done) {
      request(url)
        .post('/api/log/test')
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          // Should.js fluent syntax applied
          res.body.status.should.equal('0');
          done();
        });
    });
  });

})