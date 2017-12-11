'use strict';

const chai = require('chai');
const app = require('../app');

const expect = chai.expect;

setTimeout(() => {
  require('./initConfig');
  require('./initDownloadTemplate');
  require('./initIVideo');
  require('./initLibrary');
  require('./initPermissionGroup');
  require('./initPermissionInfo');
  require('./initUser');

  const ConfigInfo = require('../api/configuration/configurationInfo');
  const TemplateInfo = require('../api/template/templateInfo');
  const ProjectInfo = require('../api/ivideo/projectInfo');
  const ItemInfo = require('../api/ivideo/itemInfo');
  const CatalogInfo = require('../api/library/catalogInfo');
  const FileInfo = require('../api/library/fileInfo');
  const PermissionGroup = require('../api/role/permissionGroup');
  const PermissionInfo = require('../api/role/permissionInfo');
  const UserInfo = require('../api/user/userInfo');
  const RoleInfo = require('../api/role/roleInfo');

  const configInfo = new ConfigInfo();
  const templateInfo = new TemplateInfo();
  const projectInfo = new ProjectInfo();
  const itemInfo = new ItemInfo();
  const catalogInfo = new CatalogInfo();
  const fileInfo = new FileInfo();
  const permissionGroup = new PermissionGroup();
  const permissionInfo = new PermissionInfo();
  const userInfo = new UserInfo();
  const roleInfo = new RoleInfo();

  describe('init scripts', () => {
    describe('/initConfig', () => {
      it('should init config', (done) => {
        configInfo.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf(3);
          done();
        });
      });
    });

    // describe('/initDownloadTemplate', () => {
    //   it('should init download template', (done) => {
    //     templateInfo.collection.find().toArray((err, docs) => {
    //       expect(docs).to.have.lengthOf(1);
    //       done();
    //     });
    //   });
    // });

    describe('/initIVideo', () => {
      it('should init ivideo', (done) => {
        projectInfo.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf.at.least(1);
          itemInfo.collection.find().toArray((err, docs) => {
            expect(docs).to.have.lengthOf.at.least(4);
            done();
          });
        });
      });
    });

    describe('/initLibrary', () => {
      it('should init library', (done) => {
        catalogInfo.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf(30);
          fileInfo.collection.find().toArray((err, docs) => {
            expect(docs).to.have.lengthOf(30);
            done();
          });
        });
      });
    });

    describe('/initPermissionGroup', () => {
      it('should init permission group', (done) => {
        permissionGroup.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf.at.least(54);
          done();
        });
      });
    });

    describe('/initPermissionInfo', () => {
      it('should init permission', (done) => {
        permissionInfo.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf.at.least(184);
          done();
        });
      });
    });

    describe('/initUser', () => {
      it('should init user', (done) => {
        userInfo.collection.find().toArray((err, docs) => {
          expect(docs).to.have.lengthOf.at.least(1);
          roleInfo.collection.find().toArray((err, docs) => {
            expect(docs).to.have.lengthOf.at.least(1);
            done();
          });
        });
      });
    });
  });

  run();
}, 5000);
