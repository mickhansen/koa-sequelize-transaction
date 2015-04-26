# koa-sequelize-transaction

Automatically manages the CLS namespace for ssacl/sequelize allowing you to simply do:

```js
koa.use(errorHandler);
koa.use(require('koa-sequelize-transaction')({
  // pass an instance of sequelize
  sequelize: sequelize
}));
```

koa-sequelize-transaction will ensure that any Sequelize calls in subsequent koa middleware will be scoped to the same transaction.
commit/rollback will automatically be handled, you should handle any errors (on rollback) in your errorhandler and otherwise assume the transaction will succeed in your code (send a response).

Note if already using sequelize with CLS, it will automatically use that namespace instead of generating it's own.