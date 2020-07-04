# `Mkbug.js`的前世今生 - 一款`OOP`风格声明式`Nodejs`框架

> 早在`2014`年的时候第一次接触`Nodejs`，当时还在`IBM`，而注明的`Express.js`框架也是`IBM`负责维护。于是理所当然的是用`Express.js`开发`Nodejs`应用。虽然国内对`Koa`非常热衷，但是我还是有`1000`个理由选择`Express.js`。成熟可靠的维护团队和企业级应用背景，即使在`2015`年`IBM`将维护`Express.js`交给了`StrongeLoop`。

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

## 让繁琐的配置远去 -- `BaseController`路由抽象接口
在离开`IBM`后加入互联网公司一直从事`Nodejs`开发工作，互联网项目高速迭代的特点让`Nodejs`项目的路由庞大，复杂且难以维护。时间久了，哪些路由信息还在使用？哪些已经过时不用了？模块是否和路由设置一致？一个上百接口服务的路由虐的我痛不欲生。有人会说，你多拆几个文件就好啦。可是文件越多。管理起来也越繁琐。

于是第二个模块在`2016`年诞生了。也就是`BaseController`的雏形`RouterMgt`。可以自动遍历文件路径，加载模块，生成路由配置信息。本以为一切都清净了。但是看着`Koa`的兼容新`ES6`语法还是心里痒痒。但是无奈与`Nodejs 8.x`暂时还不支持那么多语法。而团队内也更倾向于`Koa`支持新语法的诱惑。但是很快由于公司业务发展不佳，公司解散了。

再加入新公司后，`Nodejs`已经发展到了`10.x`。已经支持了`99.7%`的新语法。而我需要的功能也都支持了。于是`BaseController`完成了第二个版本。也就是现在
`Mkbug.js`核心模块 ---- OOP风格声明式路由管理模块。
```js
  // 目录结构
  ├── src 
      ├── controller 
          ├── _params
              ├── _id.js
          ├── pathtest
              ├── HelloWorld.js
  ├── index.js 

  // src/controller/_params/_id.js
  const { BaseController } = require('mkbugjs');

  module.exports = class IdTest extends BaseController {
    getAction () {
      return 'Hello ! this message from IdTest';
    }
  }
  // src/controller/pathtest/HelloWorld.js
  const { BaseController } = require('mkbugjs');

  module.exports = class HelloWorld extends BaseController {
    // 为了避免与上面的接口路径冲突，所以在末尾增加了test
    getTestAction () {
      return 'Hello! this message from pathtest/hellowrold!';
    }
  }
```

它并不像`egg`或者`thinkjs`以及其它一些`Nodejs`框架那样需要自己手动管理很多配置信息。一切都会帮你配置好。你仅仅需要实现`BaseController`接口，那么`api`的路由信息就都帮你生成了。并且支持路由参数。浏览器请求结果：
```js
  $ curl -XGET http://localhost:3001/helloworld/idtest
  Hello ! this message from IdTest

  $ curl -XGET http://localhost:3001/pathtest/helloworld/test
  Hello! this message from pathtest/hellowrold!
```

是不是非常简单便捷？再也不需要那么冗余的配置文件了。工程变得更加简洁。这个模块早期版本的轻量级，门槛低，低成本，易于维护的特点，在`18`年落地了很多公司内部工具，更是在`19`年成功帮助前东家的新业务线签下两份订单。同时也经受住了大数据量访问的考验。同时提供了拦截器接口，可以获取接口响应时长等非常重要的信息。

在经历了`3`年多的打磨后，`Mkbugjs`也基于该模块诞生了。

> *Notice：因为`Controller`的方法名是非常关键的配置信息，类的方法名必须以`HTTP`协议的`Methods`名开头`Action`结尾，这样才会被识别为路由信息。如果在`Methods`和`Action`之间没有其它单词，则没有对应的路径。就像上面的例子一样。*

> *Notice：`http`协议目前支持9个方法，当然，实际上不同浏览器还有更多的方法。但是为了保持与标准同步，`Mkbug.js`支持9种方法，分别是：`GET`,`HEAD`,`POST`,`PUT`,`DELETE`,`CONNECT`,'`OPTIONS`,`TRACE`,`PATCH`。*

## `Expressjs`尴尬的响应处理
使用过`Express.js`的开发者都知道，`Express.js`必须显示调用`end`, `json`, `write`等`api`去结束响应，否则客户端会一直挂起，直至超时。而`Mkbugjs`提供了统一的响应返回机制，即只需要`return`，或者`throw`一个`MkbugError`异常对象，即可返回客户端请求。也就避免了请求挂起。同时也统一了响应返回的标准。统一系统风格。

```js
  // src/controller/StatusTest.js
  const { BaseController, MkbugError } = require('mkbugjs');

  module.exports = class StatusTest extends BaseController {
    getTestAction () {
      throw new MkbugError(500, 'Error Test')
    }
  }
```
执行结果如下：
```sh
  $ curl -w "  status=%{http_code}" localhost:3001/statustest/test
  Error Test  status=500
```

> *Notice: 在`Mkbug.js`中，任何实现`BaseController`的接口，和`BasePlugin`的中间件都可以通过这种方式自动响应客户端请求。*

## 降低中间件门槛 -- `BasePlugin` 中间件抽象接口
我带过的很多人对`JS`并不是非常深入，以至于经常把闭包，执行上下文写错。导致中间件经常出问题。而`BasePlugin`只需要用户实现自己的`exec`接口逻辑，即可自动完成中间件的配置和执行操作。并不需要开发者过多的参与底层配置。

`BasePlugin`提供一个`exec`接口，该接口主要用于实现中间件的业务逻辑，并提供了`res`和`req`接口。当我们需要拦截请求，只需要抛出`MkbugError`异常即可。否则会执行下一步路由。

```js
  // 目录结构
  ├── src 
      ├── controller 
          ├── MiddleWare.js
      ├── plugin
          ├── TestMiddleware.js
  ├── index.js 

  // src/plugin/TestMiddleware.js
  const { BasePlugin, MkbugError } = require('mkbugjs');

  module.exports = class TestMiddleware extends BasePlugin {
    exec (req, res) {
      if (req.query.test === '1') {
        throw new MkbugError(200, 'Reject from TestMiddleware')
      }
    }
  }

  // src/controller/MiddleWare.js
  const { BaseController } = require('mkbugjs');

  module.exports = class MiddleWare extends BaseController {
    getAction () {
      return 'Hello World'
    }
  }
```
这里我们创建了`3`个中间件，其中`2`个对请求中`query.test`等于`1`和`2`进行了拦截，分别返回`200`状态和`401`状态。

我们先测试第一个中间件：
```sh
  $ curl -w " status=%{http_code}" localhost:3001/api/MiddleWare?test=1
  {"msg":"Reject from TestMiddleware1"} status=200
```
在这里我们可以看到通过`MkbugError`自定义返回的`http`请求的`status`和内容。而如果在中间件中什么也不做的话：

```sh
  $ curl -w " status=%{http_code}" localhost:3001/api/MiddleWare
  Hello World status=200
```
可以看到对应的路由接口数据被正常返回。

> *Notice：这里需要注意的是`MkbugError`对象必须被`throw`出来，而不是`return`出来。*

## `Mkbug.js`的诞生
在2020年五一假期，因为疫情不能回家探亲，一个人在居所无聊，突然冒出一个想法，为什么不将这些有用的中间件组合成一个完整的框架呢？功能不亚于任何已有的Nodejs框架，而且风格更加新颖，也更接近于广大JSer对ES6新语法的诉求。

于是花了五天时间，创造了`Mkbug.js`：
```js
  const express = require('express');
  const app = express();

  const { Mkbug } = require('mkbugjs');

  new Mkbug(app)
    .create('/') // 请求url前缀
    .use(bodyParser.json()) // 使用express中间件
    .start(3001, (err) => { // 启动，同app.listen
    if (!err)
      console.log('Server started!')
    else
      console.error('Server start failed!')
  })
  
  // src/controller/HelloWorld.js
  const { BaseController } = require('mkbugjs');

  module.exports = class HelloWorld extends BaseController {
    getAction () {
      return 'Hello World';
    }
  }
```
> *Notice：`Mkbugjs`提供了丰富的`Web`服务器常用的类。只需要继承并实现对应的类，即可实现自动注入。就像`Java`流行的`Spring Boot`或者`PHP`的`Thinkphp`一样。非常简单。*

## 最后

我写了这么多你还没心动吗？目前安装量已经超过1400次/月。并完成了所有case的测试用例。还不来尝试一下吗？

[Github](https://github.com/mkbug-com/mkbug.js)
[Document](http://doc.mkbug.com)
