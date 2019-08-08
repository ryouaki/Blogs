> 如果我跟你说，我面试来这家的时候，面试题就是这个问题你会作何感想？估计一般人是不会进坑的。然而，我进来了。因为我觉得这种技术问题很好玩。仅此而已。否则工作会很无聊。

## 前言

- 其实你没啥必要解决这个bug，因为国内很多公司每周一个版本，所以压根儿就察觉不到这个bug的存在。
- 其实你大可不必解决这个bug，因为你写一个定时自动重启脚本，在一个夜深人静的夜晚默默执行重启之。
- 其实你不用非得解决这个bug，因为百度也开始支持spa系统seo，你还在那里累死累活搞蹩脚的ssr干嘛。

如果你像我一样觉得无聊，那么就往下看吧。对不对不知道。反正在我本地测试，大部分的问题都已经KO了。

### 缘起一次换工作
面试的时候面试官提出这样一个问题，他们的系统出现了一个奇怪的现象，基于Vue的SSR系统出现了CPU缓慢上升，不得不隔段时间重启一次。问我解决思路是什么？

嗯？CPU上升?是否有内存泄漏？是否每个请求都返回了？是否有阻塞的IO操作？如果是Express是否都执行了返回？缓慢上升，是什么样的幅度？QPS是多少？服务器负载是否合理？

然后我顺利的拿到了Offer，入职后给我的第二个任务就是解决这个技术问题。看到这里是不是觉得我被套路了？哈哈哈哈，但是我就是喜欢这种挑战。很好玩，否则工作会很无聊。不过对于这种技术调查很难短时间出现成果物，对于我也是很危险的一件事情。而且，嗯。。。。。。也有卸磨杀驴的可能。谁知道呢。反正这是一件很好玩的事情。管他呢。

### 问题是否真的如描述那样？
在解决一个技术难题的时候，我们往往得到的是遇到问题的人描述的表现，而实际问题的表现并不一定如描述者所说。

遇到性能问题，我们要充分了解问题的本质是什么？仅仅是CPU缓慢上涨？现代的SPA框架都有严重消耗CPU的问题，是不是服务器集群能力不足？是否伴随内存泄漏？是否有挂起的请求没有返回？这些疑问在我的脑海翻来覆去。

直到我看到系统，看到源码，登上了服务器，看到了各种服务器监控数据的时候，好家伙。有点意思，让我越加亢奋。

问题：
- CPU周期性上升，偶有下降，但是总体趋势是上升。周期在2周左右到达80%以上的占用率。
- 内存每天会有一小部分的泄漏，非常少。也会有释放。总体趋势是每天在500M左右。
- 每天访问量在有活动的时候会有大范围波动，但是整体比较平稳，不过日志系统只保留最近7天日志，造成从日志分析原因有点困难。出问题的那几天数据已经没了。
- 后端系统，在代码层面，如果没有重大代码逻辑问题，代码优化带来的性能提升是有限的。

### 第一个弯路
光从访问日志和描述者描述问题来看，在CPU居高不下的那几天恰好有访问高峰。而且从访问量降低的时候CPU使用率也是有明显降低的。于是根据那几天CPU高峰时段的用户流量来判断应该是服务器负载不足，没有顶住流量高峰。
于是拿着这个调查结果去找Leader。Leader也接受了。毕竟从数据层面是说的通的。而且在这面咨询了运维同事，他们也觉得是这样。而且当时确实有一个很大的流量高峰持续了几个小时。

但是，在接下来的几天观察发现，流量没有那么巨大的时候，依然会有缓慢的上升趋势，只是比流量高峰时段上涨的慢一些。因此第一次的调查结果宣布不对。

### 第二个弯路
根据经验分析造成CPU缓慢上涨而不能明显下降现象大多是因为有代码片段被挂起，无法释放。对于Nodejs来说无非就是几种：1 setTimeout，2 阻塞IO，3 express没调用res.end()结束请求。

开始做代码code review，发现整个项目都是基于官方vue-hackernews2.0来构建的。从代码上面问题不大。那么可能是阻塞IO？

于是找运维同学get到如何查看活动网络链接，对本地环境进行压测。然后停止半小时以后查看链接情况(因为操作系统为了优化io使用并不会在你操作结束后马上释放链接，所以要等待一会)。

压测后结果很是震惊，由于测试环境后端接口性能极差，导致超多请求被挂起。而这个时候被阻塞的socket链接也非常多，内存飙升，CPU一直没有明显下降。哈哈哈问题找到了(高兴太早了)。

于是去找运维协商是否有手段在服务器上设置断开长期无响应的链接。运维很无奈。。。。。。

好吧。还得自己来。为什么会挂起这么多链接？查阅资料，发现有这么一个现象存在：在服务器超载的情况下，由于无法做出响应，客户端的socket就会被挂起一直处于connection状态。

我去问了项目开发负责人，说他们设置了超时处理，并不会引起这种状况。。。。。。

但是我在log日志明明看到了很多200s以上才返回的请求。。。。。。说明我们代码设置的超时并没有起作用。于是我需要找到足够的证据来说服他。

> 有时候我们在沟通的时候，对方并不信任你观点，其实是源于你的证据不充分，那么这个时候，你就需要找到具有足够说服力的证据来证明你的观点。

于是深挖Nodejs文档，跟项目代码，发现axios的这块实现有问题：
```js
    if (config.timeout) {
      timer = setTimeout(function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      }
    }
```

这里代码看起来是没任何问题的，这是在前端处理中一个很典型的超时处理解决方式。

由于Nodejs中，io的链接会阻塞timer处理，因此这个setTimeout并不会按时触发，也就有了10s以上才返回的情况。

貌似问题解决了，巨大的流量和阻塞的connection导致请求堆积，服务器处理不过来，CPU也就下不来了。

在Nodejs官方文档中提到：
```
If req.abort() is called before the connection succeeds, the following events will be emitted in the following order:

- socket
- (req.abort() called here)
- abort
- close
- error with an error with message Error: socket hang up and code ECONNRESET
```

于是我给[axios提了PR](https://github.com/axios/axios/pull/1752)，解决办法就是利用socket中对于connect的超时处理来代替会在Nodejs中被阻塞的setTimeout来处理超时请求。这个问题在node-request中也存在。而且经过本地大量测试，发现在高负载下CPU和内存都在正常范围内了。以为一切都OK了。

```js
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));	
      }
    }
```

然而。。。。。。我又错了。

有一天我忘记了关电脑，本地压测的环境还在跑，第二天惊奇的发现，所有被挂起的socket资源都被释放了。但是内存，CPU依然没有被回收。关于这一点我求证了运维同事，确实操作系统会自动处理掉这些长时间不活动的链接。虽然我通过修改axios源码的方式解决了问题，但是貌似问题的本质原因并没有找对。

### 一次偶然发现vue-router中的“骚”处理
实在没有头绪，废了几天劲貌似都没有抓到问题的根本原因，虽然误打误撞解决了问题。但是这种解决问题方式对于是否能够根除问题会有一定的不确定性。

利用inspect反复的去分析系统的内存，由于线上流量非常巨大，但是内存和CPU的泄漏很小，而本地难以复现这么大的访问量，所以本地复现非常难，加上JS的GC方式，在调查上难度很大。只能一个请求一个请求后反复对比内存镜像查找哪怕一丝丝线索。

而对于CPU，那更是难以跟踪，线上每天CPU增长在每小时0.02左右。也就意味着平均一次请求对于CPU泄漏的影响微乎其微，而一旦进行大规模的请求测试，对于内存的跟踪就不准确了。

> 可能这个时候就是年龄大的程序员的优势了，可以沉得住气，耐得住性子去查找问题的。有的时候解决一个技术问题并不需要你有多么强的技术，解决问题的方式，以及耐心才是主要的。

在一次偶然发现，发起一个请求后，内存镜像中总是会出现一个timer。然后下一次抓取内存镜像又释放了一个timer。What the fxxk？什么鬼。

而这个timer却没有什么明显信息去告诉我是在哪里被创建的。再一次陷入崩溃。

难道这就是那个造成内存泄漏的根源？timer占用资源非常小，而且是异步，并不会阻塞系统，所以并不会像死循环那样导致CPU长期处于高位运行。貌似，这个timer才是问题的根源。

好在Nodejs的所有api接口都是js实现的，于是直接在setTimeout里面打断点跟踪代码。。。。。。果然是大力出奇迹。发现了vue-router中的骚操作
```js
function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (instances[key]) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(function () {
      console.log('vue-router poll');
      poll(cb, instances, key, isValid);
    }, 16);
  }
}
```

是的，没错，这是一个死循环的timer。instances是什么？通过代码应该是对应的异步组件实例，而key是对应的组件在实例数组中的键值。而退出条件只有2个：1 异步组件加载完成，2 路由发生改变。

但是在ssr的场景下，路由发生改变在每一个请求的过程中是不会发生的。因此退出条件就只剩下了异步组件加载完成。但是处于某种原因，它没加载成功。导致这个timer就陷入了死循环。而且前提是需要在组件里面实现了beforeRouteEnter这个守卫函数。

由于vue-router代码的实现太骚了。只能求助万能的github。发现了这个[issue](https://github.com/vuejs/vue-router/issues/1706#issuecomment-417157188)

和我的情况完全吻合。但是对于member的回复有一些心寒。通过题主的简单设置已经可以完美的复现问题了。团队却直接以“A boiled down repro instead of a whole app would help to identify the problem, thanks”为由给close了。。。。。。

而更加可气的是：
```js
> A boiled down repro instead of a whole app would help to identify the problem, thanks

if you have an infinite loop, it's probably next not being called without arguments  《= 以为我们都是傻子吗？不知道调next？
```

好吧。看来既然上了贼船就只能靠自己了。我和题主沟通后开始尝试解决问题。但是经过几天努力题主已经放弃了。而我。。。。。。也选择了放弃(别把我看那么高大上，说实话，看了几天vue-router源码。真的没有找到好的解决办法，主要是会修改很多东西。)。

### 解决方案
在vue-ssr中造成内存和cpu泄漏的原因目前我所调查的结果就是这么两个原因：
1. 挂起的socket造成暂时性的堵塞
2. vue-router中的timer在某些情况下会陷入死循环
3. 大量的模板编译，内存中会存留大量被字符串占用的内存

那么如何解决呢？
- 移除component中对于beforeRouteEnter的处理。将这里的处理移到其他地方，从vue-router代码层面分析是可以避免陷入timer的死循环的。
- 在nodejs中替换掉setTimeout的方式去处理服务器端请求超时，改用http.request的timeout事件handle来处理。防止io阻塞timer处理。
- 如果不是对seo要求过高，采用骨架页渲染的方式，向客户端渲染出骨架页，然后由前端直接发起ajax请求拉取服务器数据。避免在nodejs端执行服务端请求由于服务端后台无法响应造成堵塞导致部分链接被挂起。（nodejs的事件循环和浏览器是不同的，虽然都是基于V8引擎。这也是大部分国内互联网公司在vue-ssr这块的普遍应用方式）

### 也许还有
我对vue-ssr只研究了2周，如果以上有疑问欢迎及时提醒我进行改正。
