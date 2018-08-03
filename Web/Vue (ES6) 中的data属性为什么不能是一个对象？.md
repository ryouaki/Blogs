> **以下引官网原文**：当一个组件被定义，data 必须声明为返回一个初始数据对象的函数，因为组件可能被用来创建多个实例。如果 data 仍然是一个纯粹的对象，则所有的实例将共享引用同一个数据对象！通过提供 data 函数，每次创建一个新实例后，我们能够调用 data 函数，从而返回初始数据的一个全新副本数据对象。

最近来面试的很多人。我都会问这个问题“vue中，为什么data是一个方法返回一个对象，而不是直接赋给一个对象”，只有少数人会回答出是怕重复创建实例造成多实例共享一个数据对象。更多的人回答是不知道，或者是官方文档要求这么写就这么写了。

其实这个问题的考点无非就是对vue的熟悉情况，挖掘应聘者的自驱学习能力，对技术的求知欲。这样的人往往技术成长快，具备很强的独立解决问题能力。也是各个技术团队都喜欢的一种人。

首先在vue的源码中，有这样的处理：
```js
  // vue/src/core/instance/state.js
  function initData (vm: Component) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
      process.env.NODE_ENV !== 'production' && warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    ...
  }
```

显然，vue是支持将一个对象作为vue构造参数中data属性的值并且，如果data是方法的话，也会先取得内部返回的对象结果。并且在vuex中又存在这样的用法：
```js
  // vuex/src/store.js
  function resetStoreVM (store, state, hot) {
    ...
    const silent = Vue.config.silent
    Vue.config.silent = true
    store._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })
    ...
  }
```
这是怎么回事呢？既然支持，又不让我们用，而且当我们在一个vue文件中，直接给一个data赋予一个对象则会引起红色警告：
```js
  [Vue warn]: The "data" option should be a function that returns a per-instance value in component definitions.
```

这个警告来自于Vue源码中的vue/src/core/util/options.js
```js
  strats.data = function (
    parentVal: any,
    childVal: any,
    vm?: Component
  ): ?Function {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
        process.env.NODE_ENV !== 'production' && warn(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        )
        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }
    return mergeDataOrFn(parentVal, childVal, vm)
  }
```

首先我们需要了解在vue文件的代码被实例化成vue组件的过程需要经历下面这些步骤：

1. vue文件被loader处理，template被编译成render函数，script被编译成一个对象变量
2. 将script编译后的对象传入render中，并在render函数中调用vue.createElement(来自vue/src/core/vdom/create-element.js)构建vue组件
3. 在createElement中，如果是vue组件的话，通过createComponent(vue/src/core/vdom/create-component.js)构建组件
4. 将script编译出来的对象变量通过上下文的$options中取出，并使用Vue.extends(vue/src/core/global-api/extend.js)通过该对象构建出一个新的Vue对象

在4中因为使用了mergeOptions，进而触发了对data的类型验证，也就显示了之初的那个警告。

那么为一个对象的属性赋予一个对象真的就会造成共享对象么？让我们看下面的代码：
```js
  class A {
    constructor(opt) {
      this.opt = opt;
    }

    update() {
      this.opt.data.a++;
    }

    notify() {
      console.log(this.opt);
    }
  }
```

我们用这个类来虚拟化Vue的构造。然后进行测试：

```js
  // test
  let c = new A({ data: { a: 1 }});
  let d = new A({ data: { a: 1 }});

  c.update();
  d.update();
  c.notify(); // Object data: a: 2
```

我们通过字面量的方式来为构造参数传入一个对象属性，然而我们惊奇的发现，其实并没有发生共享引用的问题。这是什么鬼？

哦，不对，我们通常在使用vue的时候是在vue文件中export出一个对象，然后这个对象会在vue-loader的时候被编译传入到模版编译后的render函数中。那么我们换一个方法来做一个实验：

```js
  // test.js文件，用于虚拟vue文件导出的vue options对象
  export default {
    data: {
      a: 1
    }
  }
  
  // index.js
  let a = new A(test);
  let b = new A(test);

  a.update();
  b.update();
  a.notify(); // Object data: a: 3
```
什么？在这里产生了vue文档中提到的共享引用的问题。这是为什么呢？

原因在于vue的编译过程以及引入的import过程，通过babel编译，test.js会被转化为es5语法的js文件：
```js
  var Re = {
    data: {
      a: 1
    }
  };
  var Oe = function () {
    function e(t) {
      Object(i["a"])(this, e), this.opt = t
    }
    return Object(o["a"])(e, [{
      key: "update",
      value: function () {
        this.opt.data.a++
      }
    }, {
      key: "notify",
      value: function () {
        console.log(this.opt)
      }
    }]), e
  }(),
  Fe = new Oe(Re),
  Ne = new Oe(Re);
  Fe.update(), Ne.update(), Fe.notify();
  var $e = new Oe({
    data: {
      a: 1
    }
  }),
  Ve = new Oe({
    data: {
      a: 1
    }
  });
  $e.update(), Ve.update(), $e.notify(), 
```

What？原来我们的每一个vue文件经过babel编译，将导出的对象直接替换成了一个对象变量，然后将这个变量传入到对应的组件构造函数中。因此，也就产生了引用共享的问题(所有js对象皆引用)。

> 由于vue源码并没有通读，因此如有错误请指教

