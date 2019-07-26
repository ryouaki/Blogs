> 今天一个偶然的几乎，发现一个怪异现象。于是探究了一下，有点意思，与君共勉。

## 源于一个需求：我要画更多的对象
我们都知道，Canvas的绘制，会受硬件影响。不同的硬件设备会有明显的性能上的差异引起卡顿。但是如何影响的呢？

## 下面的实验代码
```html
<!DOCTYPE html>
<html>
  <head>
  </head>

  <body>
    <div id="canvas" style="width: 600px; height: 400px;"></div>
    <script src="ryou-test.js"></script>
    <script src="example.js"></script>
  </body>
</html>
```
```js
(function(global) {
  const RyouList = global.RyouList = function (dom, opts) {
    this._root = dom;
    this._options = {
      ratio: 1,
      ...opts
    };
    this._init();

    this._shouldUpdate = false;
    this._eles = [];
  }

  RyouList.prototype._init = function () {
    const ret = this._root.getBoundingClientRect();

    const _div = document.createElement("div");
    const _cvs = document.createElement("canvas");

    this._ctx = _cvs.getContext("2d");

    _div.appendChild(_cvs);
    _div.style.width = ret.width + 'px';
    _div.style.height = ret.height + 'px';

    _cvs.width = ret.width * this._options.ratio;
    _cvs.height = ret.height * this._options.ratio;

    this._rect = {
      width: _cvs.width,
      height: _cvs.height
    }

    this._root.appendChild(_div);
  }

  RyouList.prototype.render = function () {
    this._ctx.clearRect(0, 0, this._rect.width, this._rect.height);

    const len = this._eles.length;
    for (let i = 0; i < len; i++) {
      this._ctx.beginPath();
      this._ctx.fillStyle = "#0f0";
      this._ctx.arc(this._eles[i].x, this._eles[i].y, this._eles[i].r, 0, 2 * Math.PI);
      this._ctx.fill();
    }
  }

  RyouList.prototype.add = function () {
    this._shouldUpdate = true;
    let x = Math.random() * this._rect.width;
    let y = Math.random() * this._rect.height;

    this._eles.push({
      type: "cicle",
      x: x,
      y: y,
      r: 5
    })
  }
  
}(window))

const rc = new RyouList(document.getElementById("canvas"));

for (let i = 0; i < 26929; i++) { // ---》 注意这个for循环。
  rc.add();
}
let first = new Date().getTime()
rc.render();
console.log(new Date().getTime() - first)
```

## 实验1
1. 我们将上面代码的for循环调整到20000-26929.没存渲染页面打印结果在40ms左右。
2. 我们将上面代码的for循环调整到26930，奇迹发生么，445ms左右。
3. 我们将上面代码的for循环调整到32000，打印结果在450-550ms之间
4. 我们将上面代码的for循环调整到42000，打印结果在700ms以上

这是一个很有意思的事情，因为我的代码仅仅记录了for循环创建路径打印这一过程，因此是不受创建元素，计算随机位置的影响的，去掉for循环的性能影响，基本上是比较接近Canvas的渲染消耗的。

## 实验2
1. 我们将上面代码的园的半径调整到2，for循环为20000-26929，打印结果是19ms左右
2. 我们将上面代码的园的半径调整到2，for循环为32000，打印结果是49ms左右
3. 我们将上面代码的园的半径调整到2，for循环为42000，打印结果是49ms左右
4. 我们将上面代码的园的半径调整到2，for循环为52000，打印结果是400ms左右

是不是很有意思？Canvas的性能下降并不是线性的，而是以指数级的。在达到某个值的时候，这个性能会指数级下降

## 实验3
1. 我们将上面代码的园的半径调整到8，for循环为20000-26929，打印结果是300ms左右
2. 我们将上面代码的园的半径调整到8，for循环为32000，打印结果是400+ms左右
3. 我们将上面代码的园的半径调整到8，for循环为42000，打印结果是500ms左右
4. 我们将上面代码的园的半径调整到8，for循环为52000，打印结果是700ms左右

是不是很有意思？通过以上测试，Canvas的渲染并不是受我们绘制多少图形影响。

## 实验4
1. 我们将上面代码的园的半径调整到20，for循环为20000-26929，打印结果是1800ms左右
2. 我们将上面代码的园的半径调整到20，for循环为4000，打印结果是40ms左右

再一次证明，Canvas的渲染并不是受我们绘制多少图形影响的。

## 结论
以上4次实验，发现，我们在Canvas绘制多少次对性能的直接影响其实并不大，但是我们增大每次绘制的图形的大小的时候，性能会严重影响。

所以，Canvas性能的直接影响因素应该是我们绘制的【像素总数】，而不是绘制的元素数量。当我们绘制的像素总数达到一个阈值，那么Canvas的性能会指数级下降，这个阈值很可能就是由硬件决定的。
