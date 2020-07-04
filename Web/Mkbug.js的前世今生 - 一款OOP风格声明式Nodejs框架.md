# `Mkbug.js`的前世今生 - 一款`OOP`风格声明式`Nodejs`框架

> 早在2014年的时候第一次接触`Nodejs`，当时还在`IBM`，而注明的`Express.js`框架也是`IBM`负责维护。于是理所当然的是用`Express.js`开发`Nodejs`应用。虽然国内对`Koa`非常热衷，但是我还是有1000个理由选择`Express.js`。成熟可靠的维护团队和企业级应用背景，即使在2015年`IBM`将维护`Express.js`交给了`StrongeLoop`。

## 一切的开始都要从一个线上故障说起
当时我所在的团队负责一个内部工具系统开发，后台使用Nodejs。但是有一天用户反馈有一个线上问题。数据错了。我们马上进行回归，发现线下是没问题的。找了很久也没找到原因，后来从代码发现这个分支是由一个环境变量作为条件进行的分支处理。通过上线跟踪日志，发现实际读取的环境变量不正确。

原来上一次升级开发人员忘记了修改生产环境环境变量的设置导致的。

> 通常我们会将系统的配置信息配到一个`Shell`脚本中。然后注入到环境变量中。由于这些环境变量是在`Docker`内生效。因此并不会影响其它程序，也不会引起冲突和覆盖，并且环境迁移能力强。是一种非常常见的手动。

为什么我们不能像`Java`框架那样，从配置文件中获取呢？`Java`和`PHP`的框架都会有一个配置管理模块去自动根据当前的模式获取对应的配置信息，维护非常方便，非常智能。

于是`Mkbug.js`第一个核心模块诞生了 ---- `Config`。一个专门用来解决系统配置信息管理的模块。经过多年的项目实践和打磨，最终演变成了`Mkbug.js`的核心模块。

```js
  // 目录结构
  ├── src 
      ├── controller 
          ├── ConfigTest.js
      ├── config
          ├── index.conf
          ├── index.dev.conf
  ├── index.js 

  // src/config/index.conf
  TITLE=Mkbug.js
  Content=A OOP style declare Nodejs Web framework base on Express.js

  // src/config/index.dev.conf
  TITLE=Mkbug.js DEV

  // src/controller/ConfigTest.js
  const { BaseController, Config } = require('mkbugjs');

  module.exports = class ConfigTest extends BaseController {
    getAction () {
      const conf = new Config('index')
      return conf
    }
  }
```
当我们不设置`process.env.NODE_ENV`启动的时候，使用`curl`请求接口返回的数据我们发现，在特定环境下的配置信息会继承没有指定环境的配置信息。
```js
  $ curl -XGET http://localhost:3001/api/configtest
  {"TITLE":"Mkbug.js","Content":"A OOP style declare Nodejs Web framework base on Express.js"}
```

而当我们以`process.env.NODE_ENV=dev`启动的时候，使用`curl`请求接口返回的数据我们发现，在特定环境下的配置信息会继承没有指定环境的配置信息。
```js
  $ curl -XGET http://localhost:3001/api/configtest
  {"TITLE":"Mkbug.js DEV","Content":"A OOP style declare Nodejs Web framework base on Express.js"}
```
> *Notice：当我们没有指定具体的运行环境的时候，`Config`会默认加载与初始化参数名相同的`conf`文件，比如`index.conf`。但是当指定具体的环境（也就是`process.env.NODE_ENV=dev`）后，将会用对应环境下的同名配置文件内容对默认配置内容进行覆盖。比如本例中`index.dev.conf`的内容会覆盖`index.conf`中相同的key对应的内容。*

## 路由

