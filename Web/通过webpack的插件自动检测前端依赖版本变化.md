```js
const fs = require('fs')
const path = require('path')
const ajax = require('axios')
const _ = require('lodash')
const child_process = require('child_process')

module.exports = class PkgCheck {
  constructor(opts) {
    this._opts = opts
  }

  apply(compiler) {
    const serverOpts = this._opts
    compiler.hooks.done.tapAsync('pkgCheckPlugin', (stats, cb) => {
      const obj = stats.toJson()
      _(obj.chunks)
        .map('modules')
        .concat(obj.modules)
        .compact()
        .flatten()
        .uniqBy('id')
        .value();

      const assetTree = parseChunks(obj.chunks);
      let pkg = fs.readFileSync('./package.json')
      pkg = JSON.parse(pkg)
      const dependencies = _.merge({}, pkg.dependencies, pkg.devDependencies)
      const keys = Object.keys(assetTree)
      const wrongKeys = []
      keys.forEach((key) => {
        let version = dependencies[key] || dependencies[`'${key}'`] || null

        if (version) {
          let nversion = version
          nversion = nversion.replace('^', '')
          nversion = nversion.replace('*', '')
          nversion = nversion.replace('~', '')

          assetTree[key].versions.forEach((item) => {
            if (item !== nversion) {
              wrongKeys.push({
                name: key,
                value: [item, version],
                reason: assetTree[key].reason || []
              })
            }
          })
        }
      })
      if (wrongKeys.length > 0) {
        let content = ''
        wrongKeys.forEach((item) => {
          content += `${item.name}: ${item.value[1]} > ${item.value[0]}\n`
          content += `路径: ${item.reason}\n`
        })
        console.error(content) // 可以调发送邮件预警。
      }
      cb()
    });
  }
}

function parseChunks(chunks) {
  const dependenciesList = {}
  chunks.forEach(chunk => {
    const modules = chunk.modules
    modules.forEach((item) => {
      if (item.issuerName) {
        const paths = item.issuerName.split('/')
        let lastIdx = paths.lastIndexOf('node_modules')
        if (lastIdx > -1 && item.issuerName.indexOf('??ref--') < 0) {
          // fs.writeFileSync('./logs', JSON.stringify(item.issuerName) + '\n', {flag: 'a+'})
          let filePath = ''
          let i = 2
          for (; i < paths.length && filePath === ''; i++) {
            const uri = path.resolve(['.', ...paths.slice(0, lastIdx + i), 'package.json'].join('/'))
            if (fs.existsSync(uri)) {
              filePath = uri;
            }
          }
          let pkg = ''
          try {
            pkg = fs.readFileSync(filePath)
            const pkgJson = JSON.parse(pkg);
            if (dependenciesList[pkgJson.name]) {
              dependenciesList[pkgJson.name].versions.add(pkgJson.version)
            } else {
              dependenciesList[pkgJson.name] = {}
              dependenciesList[pkgJson.name].versions = new Set
              dependenciesList[pkgJson.name].versions.add(pkgJson.version)
            }
            dependenciesList[pkgJson.name].reason = paths.slice(0, lastIdx + i).join('/')
          } catch (e) { }
        }
      }
    })
  })
  return dependenciesList
}
```
