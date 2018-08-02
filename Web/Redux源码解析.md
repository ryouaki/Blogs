> Redux源码分析已经满大街都是了。但是大多都是介绍如何实现，实现原理。而忽略了Redux代码中隐藏的知识点和艺术。为什么称之为艺术，是这些简短的代码蕴含着太多前端同学应该掌握的`JS`知识以及巧妙的设计模式的运用。

## createStore 不仅仅是一个API

```js
...
export default function createStore(reducer, preloadedState, enhancer) {
  ...
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    ...
  }

  function getState() {
    ...
    return currentState
  }

  function subscribe(listener) {
    ...
  }

  function dispatch(action) {
    ...
    return action
  }

  function replaceReducer(nextReducer) {
    ...
  }

  function observable() {
    ...
  }

  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
```

这段代码，蕴含着很多知识。

首先是通过闭包对内部变量进行了私有化，外部是无法访问闭包内的变量。其次是对外暴露了接口来提供外部对内部属性的访问。这其实是典型的“沙盒模式”。

沙盒模式帮我们保护内部数据的安全性，在沙盒模式下，我们只能通过`return`出来的开放接口才能对沙盒内部的数据进行访问和操作。

> _虽然属性被保护在沙盒中，但是由于JS语言的特性，我们无法完全避免用户通过引用去修改属性。_

## subscribe/dispatch 订阅发布模式

### subscribe 订阅

`Redux`通过`subscribe`接口注册订阅函数，并将这些用户提供的订阅函数添加到闭包中的`nextListeners`中。

最巧妙的是考虑到了会有一部分开发者会有取消订阅函数的需求，并提供了取消订阅的接口。

这个接口的'艺术'并不仅仅是实现一个订阅模式，还有作者严谨的代码风格。
```js
if (typeof listener !== 'function') {
  throw new Error('Expected the listener to be a function.')
}
```
充分考虑到入参的正确性，以及通过`isDispatching`和`isSubscribed`来避免意外发生。

其实这个实现也是一个很简单的`高阶函数`的实现。是不是经常在前端面试题里面看到？(T_T)

> _这让我想起来了。很多初级，中级前端工程师调用完`addEventListener`就忘记使用`removeEventListener`最终导致很多闭包错误。所以，记得在不在使用的时候取消订阅是非常重要的。_

### dispatch 发布

通过`Redux`的`dispatch`接口，我们可以发布一个action对象，去通知状态需要做一些改变。

同样在函数的入口就做了严格的限制：
```js
if (!isPlainObject(action)) {
  throw new Error(
    'Actions must be plain objects. ' +
      'Use custom middleware for async actions.'
  )
}

if (typeof action.type === 'undefined') {
  throw new Error(
    'Actions may not have an undefined "type" property. ' +
      'Have you misspelled a constant?'
  )
}

if (isDispatching) {
  throw new Error('Reducers may not dispatch actions.')
}
```
不得不说，作者在代码健壮性的考虑是非常周全的，真的是自叹不如，我现在基本上是只要自己点不出来问题就直接提测。 (T_T)

下面的代码更严谨，为了保障代码的健壮性，以及整个`Redux`的`Store`对象的完整性。直接使用了`try { ... } finally { ... }`来保障`isDispatching`这个内部全局状态的一致性。
> _再一次跪服+掩面痛哭 (T_T)_

后面就是执行之前添加的订阅函数。当然订阅函数是没有任何参数的，也就意味着，使用者必须通过`store.getState()`来取得最新的状态。

## observable 观察者

从函数字面意思，很容易猜到`observable`是一个观察者模式的实现接口。

```js
function observable() {
  const outerSubscribe = subscribe
  return {
    subscribe(observer) {
      if (typeof observer !== 'object' || observer === null) {
        throw new TypeError('Expected the observer to be an object.')
      }

      function observeState() {
        if (observer.next) {
          observer.next(getState())
        }
      }

      observeState()
      const unsubscribe = outerSubscribe(observeState)
      return { unsubscribe }
    },

    [$$observable]() {
      return this
    }
  }
}
```
在开头，就将订阅接口进行了拦截，然后返回一个新的对象。这个对象为用户提供了添加观察对象的接口，而这个观察对象需要具有一个`next`函数。

## combineReducers 又双叒叕见“高阶函数”

```js
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state
  }
}
```

再一次被作者的严谨所折服，从函数开始就对参数的有效性进行了检查，并且只有在非生产模式才进行这种检查。并在`assertReducerShape`中对每一个注册的`reducer`进行了正确性的检查用来保证每一个`reducer`函数都返回非`undefined`值。

哦！老天，在返回的函数中，又进行了严格的检查(T_T)。然后将每一个`reducer`的返回值重新组装到新的`nextState`中。并通过一个浅比较来决定是返回新的状态还是老的状态。

## bindActionCreators 还是高阶函数

```js
function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments))
  }
}

export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${
        actionCreators === null ? 'null' : typeof actionCreators
      }. ` +
        `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}
```
我平时是很少用这个`API`的，但是这并不阻碍我去欣赏这段代码。可能这里是我唯一能够吐槽大神的地方了`for (let i = 0; i < keys.length; i++) {`，当然他在这里这么用其实并不会引起什么隐患，但是每次循环都要取一次`length`也是需要进行一次多余计算的(^_^)v，当然上面代码也有这个问题。

其实在开始位置的`return dispatch(actionCreator.apply(this, arguments))`的`apply(this)`的使用更是非常的666到飞起。

一般我们会在组件中这么做：
```jsx
import { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as TodoActionCreators from './TodoActionCreators'
console.log(TodoActionCreators)

class TodoListContainer extends Component {
  componentDidMount() {
    let { dispatch } = this.props
    let action = TodoActionCreators.addTodo('Use Redux')
    dispatch(action)
  }

  render() {
    let { todos, dispatch } = this.props

    let boundActionCreators = bindActionCreators(TodoActionCreators, dispatch)
    console.log(boundActionCreators)

    return <TodoList todos={todos} {...boundActionCreators} />
  }
}

export default connect(
  state => ({ todos: state.todos })
)(TodoListContainer)
```
当我们使用`bindActionCreators`创建action发布函数的时候，它会自动将函数的上下文(`this`)绑定到当前的作用域上。但是通常我为了解藕，并不会在action的发布函数中访问`this`,里面只存放业务逻辑。

> _再一个还算可以吐槽的地方就是对于Object的判断，对于function的判断重复出现多次。当然，单独拿出来一个函数来进行调用，性能代价要比直接写在这里要大得多。_

## applyMiddleware 强大的聚合器

```js
import compose from './compose'

export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```
通过前面的代码，我们可以发现`applayMiddleware`其实就是包装`enhancer`的工具函数，而在`createStore`的开始，就对参数进行了适配。

通常我们会像下面这样注册`middleware`：
```js
const store = createStore(
  reducer,
  preloadedState,
  applyMiddleware(...middleware)
)
```
或者
```js
const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)
```
所以，我们会惊奇的发现。哦，原来我们把`applyMiddleware`调用放到第二个参数和第三个参数都是一样的。所以我们也可以认为`createStore`也实现了适配器模式。当然，貌似有一些牵强(T_T)。

关于`applyMiddleware`，也许最复杂的就是对`compose`的使用了。
```js
const middlewareAPI = {
  getState: store.getState,
  dispatch: (...args) => dispatch(...args)
}
const chain = middlewares.map(middleware => middleware(middlewareAPI))
```
通过以上代码，我们将所有传入的`middleware`进行了一次剥皮，把第一层高阶函数返回的函数拿出来。这样`chain`其实是一个`(next) => (action) => { ... }`函数的数组，也就是中间件剥开后返回的函数组成的数组。
然后通过`compose`对中间件数组内剥出来的高阶函数进行组合形成一个调用链。调用一次，中间件内的所有函数都将被执行。
```js
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
因此经过`compose`处理后，传入中间件的`next`实际上就是`store.dispatch`。而这样处理后返回的新的`dispatch`，就是经过`applyMiddleware`第二次剥开后的高阶函数`(action) => {...}`组成的函数链。而这个函数链传递给`applyMiddleware`返回值的`dispatch`属性。

而通过`applyMiddleware`返回后的`dispatch`被返回给`store`对象内，也就成了我们在外面使用的`dispatch`。这样也就实现了调用`dispatch`就实现了调用所有注册的中间件。

## 结束语
Redux的代码虽然只有短短几百行，但是蕴含着很多设计模式的思想和高级JS语法在里面。每次读完，都会学到新的知识。而作者对于高阶函数的使用是大家极好的参考。

当然本人涉足`JS`开发时间有限。会存在很多理解不对的地方，希望大咖指正。
