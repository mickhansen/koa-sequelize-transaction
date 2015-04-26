'use strict';

var koaSequelizeTransaction = require('../lib')
  , koa = require('koa')
  , chai = require('chai')
  , expect = chai.expect
  , Sequelize = require('sequelize')
  , co = require('co')
  , sinon = require('sinon');

require('co-mocha');

describe('koa-sequelize-transaction', function () {
  beforeEach(function () {
    this.sequelize = new Sequelize(null, null, null, {
      dialect: 'sqlite',
      logging: false
    });
  });

  it('should define a namespace', function *() {
    var app = koa()
      , request;

    app.use(koaSequelizeTransaction({
      sequelize: this.sequelize
    }));

    app.use(function *(next) {
      expect(Sequelize.cls.get('transaction')).to.be.ok;
      yield next;
    });

    app.use(function *(next) {
      this.body = {};
      yield next;
    });

    request = require('co-supertest').agent(app.listen());
    yield request.get('/').expect(200).end();
  });

  it('should throw if sequelize errors', function *() {
    var app = koa()
      , request
      , Model = this.sequelize.define('User', {})
      , spy;

    app.use(function *(next) {
      try {
        yield next;
      } catch (err) {
        if (err instanceof Sequelize.Error) {
          this.status = 403;
          this.body = {};
          return;
        }
        throw err;
      }
    });

    app.use(function *(next) {
      yield next;
      expect(spy.callCount).to.equal(1);
    });

    app.use(koaSequelizeTransaction({
      sequelize: this.sequelize
    }));

    app.use(function *(next) {
      spy = sinon.spy(Sequelize.cls.get('transaction'), 'rollback');
      yield next;
    });

    app.use(function *(next) {
      this.user = yield Model.findOne({where: {}});
    });

    app.use(function *(next) {
      this.body = {};
      yield next;
    });

    request = require('co-supertest').agent(app.listen());
    yield request.get('/').expect(403).end();
  });

  it('should succeed if sequelize errors', function *() {
    var app = koa()
      , request
      , Model = this.sequelize.define('User', {})
      , spy;

    yield Model.sync({force: true});

    app.use(function *(next) {
      yield next;
      expect(spy.callCount).to.equal(1);
    });

    app.use(koaSequelizeTransaction({
      sequelize: this.sequelize
    }));

    app.use(function *(next) {
      spy = sinon.spy(Sequelize.cls.get('transaction'), 'commit');
      yield next;
    });

    app.use(function *(next) {
      this.user = yield Model.findOne({where: {}});
      yield next;
    });

    app.use(function *(next) {
      this.body = {};
      yield next;
    });

    request = require('co-supertest').agent(app.listen());
    yield request.get('/').expect(200).end();
  });
});