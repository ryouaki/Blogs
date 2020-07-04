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

## 被路由设置搞的恼火
在离开`IBM`后加入互联网公司一直从事`Nodejs`开发工作，互联网项目高速迭代的特点让Nodejs项目的路由庞大，复杂且难以维护。时间久了，哪些路由信息还在使用？哪些已经过时不用了？模块是否和路由设置一致？一个上百接口服务的路由虐的我痛不欲生。有人会说，你多拆几个文件就好啦。可是文件越多。管理起来也越繁琐。

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

它并不像`egg`或者`thinkjs`以及其它一些`Nodejs`框架那样需要自己手动管理路由信息。一切都会帮你配置好。你仅仅需要实现`BaseController`接口，那么`api`的路由信息就都帮你生成了。并且支持路由参数。浏览器请求结果：
```js
  $ curl -XGET http://localhost:3001/helloworld/idtest
  Hello ! this message from IdTest

  $ curl -XGET http://localhost:3001/pathtest/helloworld/test
  Hello! this message from pathtest/hellowrold!
```

是不是非常简单便捷？再也不需要那么冗余的配置文件了。工程变得更加简洁。这个模块早期版本的轻量级，门槛低，低成本，易于维护的特点，在`18`年落地了很多公司内部工具，更是在`19`年成功帮助前东家的新业务线签下两份订单。同时也经受住了大数据量访问的考验。

在经历了`3`年多的打磨后，`Mkbugjs`也基于该模块诞生了。

> *Notice：因为`Controller`的方法名是非常关键的配置信息，类的方法名必须以`HTTP`协议的`Methods`名开头`Action`结尾，这样才会被识别为路由信息。如果在`Methods`和`Action`之间没有其它单词，则没有对应的路径。就像上面的例子一样。*

> *Notice：`http`协议目前支持9个方法，当然，实际上不同浏览器还有更多的方法。但是为了保持与标准同步，`Mkbug.js`支持9种方法，分别是：`GET`,`HEAD`,`POST`,`PUT`,`DELETE`,`CONNECT`,'`OPTIONS`,`TRACE`,`PATCH`。*


