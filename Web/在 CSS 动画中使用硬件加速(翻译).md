> 在最近一个项目中，因为初期没有做太好的规划与人员技术能力有限，在性能方面有很多问题，而我加入这个项目的主要任务就是进行各种性能优化。其中对于重排重绘以及硬件加速相关优化进行的比较多，这种优化方式成本比较低，风险小，在配置较差设备效果明显。此文章来之[原文链接](https://www.sitepoint.com/introduction-to-hardware-acceleration-css-animations)

近些年，我们总是听到硬件加速，以及它如何帮助我们提升网页的动画性能，让网页动画变得更好，在移动端更流畅。但是我想一大部分经验少的工程师是不知道硬件加速是如何工作的以及我们如何使用它来帮助我们让动画变得更流畅。

硬件加速听起来非常复杂，像高等数学。在这篇文章中，我会简明的讲解如何在你的前端工程中使用这项技术。

## 为什么需要它?
让我们看一个简单的动画例子，一些球叠加在一起。然后移动这一组球按照一个四边形轨迹移动。最简单的办法就是通过设置`left`和`top`来实现。我们可以通过`JavaScript`来实现，但是我们会使用`css`来实现。请注意，我没有使用任何辅助库，比如`Autoprefixer`，但是建议你在项目中使用这种库来自动补充前缀

```css
.ball-running {
  animation: run-around 4s infinite;
}

@keyframes run-around {
  0%: {
    top: 0;
    left: 0;
  }

  25% {
    top: 0;
    left: 200px;
  }

  50% {
    top: 200px;
    left: 200px;
  }

  75% {
    top: 200px;
    left: 0;
  }
}
```
这是一个在线例子。通过按钮来运行`JavaScript`启动动画：

[CodePen Preview for Animating overlapping balls with top/left Properties](https://codepen.io/SitePoint/embed/preview/WQVxQQ?height=544&theme-id=6441&slug-hash=WQVxQQ&default-tab=result&user=SitePoint&preview=true)

点击“Start Animation”，你会发现动画在任何桌面浏览器运行的都并不是很顺畅。如果你在移动端运行这个动画网页，你会看到很严重的丢帧现象(译者注:其实)。为了解决这个问题，我们可以使用`transform`的`translate()`函数代替对`left`和`top`的改变。
```css
.ball-running {
  animation: run-around 4s infinite;
}

@keyframes run-around {
  0%: {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(200px, 0);
  }

  50% {
    transform: translate(200px, 200px);
  }

  75% {
    transform: translate(0, 200px);
  }
}
```
在下面例子中尝试运行上面的代码：

[Animating overlapping balls with CSS transforms](https://codepen.io/SitePoint/embed/preview/OyKXyK?height=524&theme-id=6441&slug-hash=OyKXyK&default-tab=result&user=SitePoint&preview=true)

现在动画比以前流畅多了。非常好！那么，为什么会这样呢？哈，css的`transform`并没有不像操作`left`和`top`属性那样导致重绘。让我们看看`Chrome`中的`DevTools`里面`Timeline`页面的执行结果(译者注：在`Chrome`新版本中，该工具变成了`performance`)。

![](https://user-gold-cdn.xitu.io/2018/8/1/164f4028a6ddc35d?w=756&h=308&f=png&s=87512)

在`left`和`top`这个例子中，我们可以看到在每一个步骤都有绿色柱状图。这是一个性能代价很高的操作。动画会产生丢帧，这也是我们优化动画效果的标准。

项目看看`css`的`transforms`的时间线：

![](https://user-gold-cdn.xitu.io/2018/8/1/164f3fbce2d6bbe3?w=861&h=351&f=png&s=56816)

就像你看到的那样，几乎没有绿色的柱形图出现。

另一个用于跟踪重绘处理的工具是`Chrome`的`DevTools`中`rendering`里面的`Enable paint flashing`选项。当该选项被选中，绿色的框会出现在重绘的区域。在`left`和`top`的例子中，当动画运行的时候，球就有一个绿色的框，因此球就发生了重绘。

![](https://user-gold-cdn.xitu.io/2018/8/1/164f3fc16cccad2b?w=800&h=393&f=jpeg&s=28338)

在另一个例子中，重绘仅仅发生在动画开始和结束的时候。

那么`transform`是如何让动画不会导致重绘的呢？最直接的答案就是`transform`会直接使用硬件加速，在`GPU`中运行，绕开了软件渲染。

## 硬件加速如何工作的
当浏览器接收到页面的信息，他会将页面解释成`DOM`输。`DOM`树和`CSS`让浏览器构建渲染树。渲染书包含渲染对象 - 在页面中需要渲染的元素。每一个渲染对象被分配到一个图层中。每一个图层被更新到`GPU`。这里的秘诀就在于通过`transform`的层会使用`GPU`渲染，因此不需要重绘，就像3D图形一样。这个转换是单独处理的。

在我们的例子中，`CSS`的`transform`在`GPU`直接创建一个新的层。`Chrome`的`DevTools`的“Show layer borders”选项可以帮助我们查看那些是单独的层，开启这个选项以后单独的层会具有一个橙色的边框。

使用`transform`样式的球会被一个橙色的边框所包围，因此它在一个独立的层中：

![](https://user-gold-cdn.xitu.io/2018/8/1/164f3fdaa1693008?w=800&h=340&f=jpeg&s=26686)

在此，你可能会问：什么时候浏览器会创建这种独立的层呢？

在以下情况会产生新的层：

- 3D 或者 `CSS`的`transform`属性
- `<video>` 和 `<canvas>` 元素
- `CSS`的`filter`属性
- 覆盖在其它元素之上的元素，比如通过`z-index`提升层级

你可能会想，‘等等，这个例子用的是2D转换，并不是3D转换’。是的。这就是为什么在开始和结束的时候会有两次重绘产生。

![](https://user-gold-cdn.xitu.io/2018/8/1/164f3fe0790edcf6?w=861&h=351&f=png&s=69293)

3D转换和2D转换的不同在于是否提前生成新的层，如果是2D的话是在实行的时候。在动画开始的时候，一个新的层被创建，并且被传入`GPU`处理。当动画结束，独立的层被移除，结果被重新绘制。

## 在`GPU`渲染元素
并不是所有的`CSS`属性变化都会直接在`GPU`处理。只有下面的属性会这样处理：

- transform
- opacity
- filter

因此为了页面更加流畅，高性能的动画，我们需要尽可能的使用`GPU`来处理。

## 强制在`GPU`渲染
在某些情况下，它会在动画开始的时候尝试在`GPU`渲染一个元素。这可以帮助我们避免创建新层的时候导致重绘。因此，我们需要使用`transform hack`技术
```css
.example1 {
  transform: translateZ(0);
}

.example2 {
  transform: rotateZ(360deg);
}
```
这么做会让浏览器知道，我们希望采用3D的方式做转换，这会让浏览器在最开始的时候就使用`GPU`处理，启动硬件加速。

这个技术也可以用于结构复杂的元素上。让我们回到第一个例子，修改这个例子为包含一个球，还有使用`filter`属性并一个具有一个背景图片的容器。球通过`left`和`top`实现动画效果。

[Animating a ball with top/left properties](https://codepen.io/SitePoint/embed/preview/LpwZbJ?height=527&theme-id=6441&slug-hash=LpwZbJ&default-tab=result&user=SitePoint&preview=true)

再一次，动画开始丢帧。因为每一次重绘都导致了大量的性能消耗。

现在让我们加上`transform hack`。

[Animating left/top properties with hardware acceleration](https://codepen.io/SitePoint/embed/preview/zvgBNp?height=547&theme-id=6441&slug-hash=zvgBNp&default-tab=result&user=SitePoint&preview=true)

现在就没之前那么糟糕了。为什么？因为现在背景再一个独立的层中处理，因此重绘的代价变得很低。

## 使用硬件加速需要注意的地方
天下没有免费的午餐。对于硬件加速，目前有几个问题。

### Memory 
大部分重要的问题都是关于内存。`GPU`处理过多的内容会导致内存问题。这在移动端和移动端浏览器会导致崩溃。因此，通常不会对所有的元素使用硬件加速。

### Font rendering 
在`GPU`渲染字体会导致抗锯齿无效。这是因为`GPU`和`CPU`的算法不同。因此如果你不在动画结束的时候关闭硬件加速，会产生字体模糊。

## The Near Future
有必要使用`transform hack`的地方是提高性能。浏览器自身也提供了优化的功能，这也就是`will-change`属性。这个功能允许你告诉浏览器这个属性会发生变化，因此浏览器会在开始之前对其进行优化。这里有一个例子：
```css
.example {
  will-change: transform;
}
```
遗憾的是，并不是所有浏览器都支持这个功能。

## 文末
概述以下我们都讲了什么：

- `GPU`渲染可以提高动画性能
- `GPU`渲染会提高动画的渲染帧数
- 使用会导致`GPU`渲染的`CSS`属性
- 理解如何通过“transform hack”强制让一个元素在`GPU`渲染
