'use strict';

var Sequelize = require('sequelize')
  , cls = require('continuation-local-storage')
  , co = require('co');

module.exports = function(options) {
  var namespace;

  if (!options.sequelize || !(options.sequelize instanceof Sequelize)) {
    throw new Error('koa-sequelize-transaction must be passed an instance of Sequelize');
  }

  if (Sequelize.cls) {
    namespace = Sequelize.cls;
  } else {
    namespace = cls.createNamespace('koa-sequelize-transaction');
    Sequelize.cls = namespace;
  }

  return function *(next) {
    yield options.sequelize.transaction(function (t) {
      return co(function *() {
        yield next;
      });
    });
  };
};