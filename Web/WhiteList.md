```js
module.exports = function(whitelist = []) {
  const _whitelist = whitelist;
  return (req, res, next) => {
    const path = req.path;
    const opts = _whitelist.find((item) => {
      return item.path === path || item.method.toLowerCase() === req.method.toLowerCase();
    });
    if (opts && opts.permissions.length > 0) {
      const permissions = req.session && req.session.permissions || [];
      const index = permissions.indexOf((item) => {
        return opts.permissions.indexOf(item) >= 0;
      })
      const isLoginNeed = (opts.permissions.indexOf('401') >= 0)
      if (index >= 0) {
        next();
      } else if (isLoginNeed) {
        res.status(401).json({ data: null, msg: 'Must login first', code: 401 });
      } else {
        res.status(403).json({ data: null, msg: 'Permission denied', code: 403 });
      }
    } else {
      next();
    }
  }
}
```

```js
const config = require('./../config')

module.exports = [
  {
    path: `${config.baseUrl[0]}/common`,
    method: 'get',
    permissions: ['isAdmin']
  }
];

```
