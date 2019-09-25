```js
  readyState属性有五个状态值。

  0：是uninitialized，未初始化。已经创建了XMLHttpRequest对象但是未初始化。
  1：是loading.已经开始准备好要发送了。
  2：已经发送，但是还没有收到响应。
  3：正在接受响应，但是还不完整。
  4：接受响应完毕。
  responseText：服务器返回的响应文本。只有当readyState>=3的时候才有值，根据readyState的状态值，可以知道，当readyState=3，返回的响应文本不完整，只有readyState=4，完全返回，才能接受全部的响应文本。

  responseXML：response  as Dom Document object。响应信息是xml，可以解析为Dom对象。
  status：服务器的Http状态码，若是200，则表示OK，404，表示为未找到。
  statusText：服务器http状态码的文本。比如OK，Not Found。
```
