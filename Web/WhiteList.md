```js
const pathToRegexp = require('path-to-regexp');

module.exports = function(whitelist = []) {
  const _whitelist = whitelist;
  return (req, res, next) => {
    const path = req.path;
    const opts = _whitelist.find((item) => {
      const reg = pathToRegexp(item.path);
      const isMatched = reg.test(path);
      return isMatched && item.method.toLowerCase() === req.method.toLowerCase();
    });
    if (opts && opts.permissions && opts.permissions.length > 0) {
      const permissions = req.session && req.session.userInfo && req.session.userInfo.permissions || [];
      let hasPermission = true;
      for( let i = 0; i < opts.permissions.length && hasPermission; i++) {
        if (permissions.indexOf(opts.permissions[i]) < 0) {
          hasPermission = false;
        }
      }

      const isLoginNeed = (opts.permissions.indexOf(401) >= 0 && permissions.indexOf(401) >= 0);
      if (hasPermission) {
        next();
      } else if (!isLoginNeed) {
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
