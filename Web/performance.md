```js
/**
 * getBorwserInfo 获取网页加载完成所需性能数据
 * @function
 * @param {String} navigationStart 同一个窗口中，前一个网页unload的时间戳
 * @param {String} unloadEventStart 前一个页面unload的开始时间戳和结束时间戳
 * @param {String} unloadEventEnd
 * @param {String} redirectStart 重定向发生的开始时间戳和结束时间戳
 * @param {String} redirectEnd
 * @param {String} fetchStart 浏览器准备好使用 HTTP 请求抓取文档的时间，这发生在检查本地缓存之前
 * @param {String} domainLookupStart DNS域名查询的开始与结束时间戳，如果使用了缓存等于fetchStart
 * @param {String} domainLookupEnd
 * @param {String} connectStart 建立链接开始时间与握手结束时间
 * @param {String} connectEnd
 * @param {String} secureConnectionStart HTTPS 连接开始的时间，如果不是安全连接，则值为 0
 * @param {String} requestStart HTTP 请求读取真实文档开始的时间和结束时间（完成建立连接），包括从本地读取缓存
 * @param {String} responseStart HTTP 开始接收响应的时间（获取到第一个字节），包括从本地读取缓存
 * @param {String} responseEnd HTTP 响应全部接收完成的时间（获取到最后一个字节），包括从本地读取缓存
 * @param {String} domLoading 开始解析渲染 DOM 树的时间，此时 Document.readyState 变为 loading，并将抛出 readystatechange 相关事件
 * @param {String} domInteractive 完成解析 DOM 树的时间，Document.readyState 变为 interactive，并将抛出 readystatechange 相关事件,
 *                                     注意只是 DOM 树解析完成，这时候并没有开始加载网页内的资源
 * @param {String} domContentLoadedEventStart DOM 解析完成后，网页内资源加载开始的时间
 * @param {String} domContentLoadedEventEnd DOM 解析完成后，网页内资源加载完成的时间（如 JS 脚本加载执行完毕）
 * @param {String} domComplete DOM 树解析完成，且资源也准备就绪的时间，Document.readyState 变为 complete，并将抛出 readystatechange 相关事件
 * @param {String} loadEventStart load 事件发送给文档，也即 load 回调函数开始执行的时
 * @param {String} loadEventEnd load 事件的回调函数执行完毕的时间
 * @return {Object} loadPage 页面总耗时，beforeLoad加载耗时，domReady构建页面耗时，lookupDomain解析dns耗时
 *
 */
export function getBorwserInfo() {
  let timing = getBorwserTiming();

  const {
    loadEventEnd = 0,
    navigationStart = 0,
    domComplete = 0,
    responseEnd = 0,
    domainLookupEnd = 0,
    domainLookupStart = 0,
    responseStart = 0,
    requestStart = 0,
    loadEventStart = 0,
    fetchStart = 0,
    connectEnd = 0,
    connectStart = 0
  } = timing;

  return {
    loadPage: loadEventEnd - navigationStart, // 页面加载完成时间，记页面开始加载到onload事件完成时间之差，js阻塞？服务器过慢？文件过大?
    beforeLoad: loadEventStart - navigationStart, // onload加载之前的时间，可以用于衡量页面资源加载和js，css，html解析消耗时间是否过长
    domReady: domComplete - responseEnd, // 解析 DOM 树结构的时间, 页面DOM过于复杂？
    lookupDomain: domainLookupEnd - domainLookupStart, // DNS 查询时间, 是否需要进行DNS预解析
    ttfb: responseStart - navigationStart, // 读取页面第一个字节的时间
    request: responseEnd - requestStart, // 内容加载完成的时间
    loadEvent: loadEventEnd - loadEventStart, // onload 里面是不是干了太多事情了
    appcache: domainLookupStart - fetchStart, // 缓存判断和加载花费
    connect: connectEnd - connectStart // 建立链接时间
  };
}
```

资源加载性能
```js
let  entryTimesList = [];
  let entryList = window.performance.getEntries();
  entryList.forEach((item,index)=>{
  
     let templeObj = {};
     
     let usefulType = ['navigation','script','css','fetch','xmlhttprequest','link','img'];
     if(usefulType.indexOf(item.initiatorType)>-1){
       templeObj.name = item.name;
       
       templeObj.nextHopProtocol = item.nextHopProtocol;
      
       //dns查询耗时
       templeObj.dnsTime = item.domainLookupEnd - item.domainLookupStart;

       //tcp链接耗时
       templeObj.tcpTime = item.connectEnd - item.connectStart;
       
       //请求时间
       templeObj.reqTime = item.responseEnd - item.responseStart;

       //重定向时间
       templeObj.redirectTime = item.redirectEnd - item.redirectStart;

       entryTimesList.push(templeObj);
     }
  });
```
