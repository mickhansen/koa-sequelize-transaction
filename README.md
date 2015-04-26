# koa-sequelize-transaction

Automatically manages the CLS namespace for ssacl/sequelize allowing you to simply do:

```js
var _ = require('koa-route')
  , koa = require('koa')
  , app = koa();

app.use(errorHandler);
app.use(require('koa-sequelize-transaction')({
  // pass an instance of sequelize
  sequelize: sequelize
}));

app.use(_.post('/pets', function *() {
  // Both calls are automatically in the same transaction
  var pet = yield Pet.create({});
  yield pet.addOwner(this.actor);
}));
```

koa-sequelize-transaction will ensure that any Sequelize calls in subsequent koa middleware will be scoped to the same transaction.
commit/rollback will automatically be handled, you should handle any errors (on rollback) in your errorhandler and otherwise assume the transaction will succeed in your code (send a response).

Note if already using sequelize with CLS, it will automatically use that namespace instead of generating it's own.