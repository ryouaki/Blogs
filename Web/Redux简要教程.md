# Redux

Redux 是一个面向 JavaScript 应用的状态管理工具。它可以帮助我们写出更清晰，更容易测试的代码，并且可以使用在任何不同的环境下。Redux 是 Flux 的一种实现，它简化了 Flux 繁琐的 store 而采用单一数据源的方式，大大减小了状态管理的复杂度。相比 Flux 更容易被大家接受。

你可以在 React 中使用。与其它 JavaScript 一起使用也是可以的。它是与框架无关的。

> _**Note**: 面试送命题，被问到 Vuex 和 Redux 哪个好？这个真的是送命题，尤其是遇到那种主观技术倾向严重的面试官。比如偏好 Vue 或者 React 的，毕竟 Redux 的用法繁琐，需要多写很多代码而被国人所诟病。但是很多人却没有看到 Redux 使代码结构更清晰。_
> _**Note**: 之前发表在掘金的 [Redux 源码解析](https://juejin.im/post/5b1fbd145188257d547217f4)。_

Redux 包含 reducers，middleware，store enhancers，但是却非常简单。如果你之前构建过 Flux 应用，那么对于你来说就更简单了。即使你没有使用过 Flux，依然也是很简单的。

### Actions

Actions 是应用程序将数据发送到 store 的载体。可以通过 store.dispatch 来将 action 发送到 store 中。

下面是几个例子:

\`\`\`js
  const ADD_TODO = 'ADD_TODO';

  {
    type: ADD_TODO,
    text: 'Build my first Redux app'
  }
\`\`\`

Actions 是一个原生 JavaScript 对象，并且必须带有一个 type 属性作为识别行为的标示。type 是一个静态字符串。如果你的应用很庞大，那么你需要把他们移到一个模块中：

\`\`\`JS
  import { ADD_TODO, REMOVE_TODO } from '../actionTypes'
\`\`\`

### Action Creators

Action Creators 是用于创建 action 对象的函数:

\`\`\`JS
  function addTodo(text) {
    return {
      type: ADD_TODO,
      text
    }
  }
\`\`\`

在一些复杂应用中，我们还需要在 Action Creator 中派发其它 action:

\`\`\`JS
  function addTodoWithDispatch(text) {
    const action = {
      type: ADD_TODO,
      text
    }
    dispatch(action)
  }
\`\`\`

当然还有更复杂的，直接派发一个 Action Creator:

\`\`\`JS
  dispatch(addTodo(text))
  dispatch(completeTodo(index))
\`\`\`

### Reducers

Reducers 用于根据接受的 action 对象，对 store 内的数据进行相应的处理，action 只描述发生了什么，并不描述应用程序的状态改变，改变发生在 reducer 中。

在 Redux 中，所有的状态存储在一个单一对象中，在某些复杂的应用中，你需要设计复杂的实体。我们建议你保持你的状态尽可能普通，不要嵌套。保持每一个实体和一个 ID 这样的 key 关联。然后用 ID 在其它实体中访问这个实体。把应用的状态想象成数据库。

Reducer 必须是一个纯函数，它的参数是之前的状态和接收的 action，然后返回一个新的状态对象。

\`\`\`JS
  (previousState, action) => newState
\`\`\`

之所以叫做 reducer 是因为它被作为一种函数被传入到 Array.prototype.reduce(reducer, ?initialValue)。这是保持 reducer 是一个纯函数是非常重要的。不要在里面做下面的事情:

- 改变参数
- 执行 API 请求，或者路由切换
- 调用非纯函数，比如 Date.now()

下面的代码将会是一个非常简单的 reducer 实现:

\`\`\`JS
  import { VisibilityFilters } from './actions'
  ​
  const initialState = {
    visibilityFilter: VisibilityFilters.SHOW_ALL,
    todos: []
  }
  ​
  function todoApp(state, action) {
    if (typeof state === 'undefined') {
      return initialState
    }
  ​
    // For now, don't handle any actions
    // and just return the state given to us.
    return state
  }
\`\`\`

我们必须在 reducer 中处理完 action 后创建一个新的 state 并作为返回值。像下面这样：

\`\`\`JS
  { ...state, ...newState }
\`\`\`

reducer 在默认情况下或者遇到未知 action 的时候，需要返回传入的 state 。

\`\`\`JS
  import {
    ADD_TODO,
    TOGGLE_TODO,
    SET_VISIBILITY_FILTER,
    VisibilityFilters
  } from './actions'
  ​
  ...
  ​
  function todoApp(state = initialState, action) {
    switch (action.type) {
      case SET_VISIBILITY_FILTER:
        return Object.assign({}, state, {
          visibilityFilter: action.filter
        })
      case ADD_TODO:
        return Object.assign({}, state, {
          todos: [
            ...state.todos,
            {
              text: action.text,
              completed: false
            }
          ]
        })
      default:
        return state
    }
  }
\`\`\`

就像之前提到的，我们并不是直接操作 state 或者它的属性，而是返回一个新的对象。

有的时候，我们的系统过于庞大，这样 reducer 就会变得复杂而庞大。这个时候我们就需要将 reducer 拆分

\`\`\`js
  function todos(state = [], action) {
    switch (action.type) {
      case ADD_TODO:
        return [
          ...state,
          {
            text: action.text,
            completed: false
          }
        ]
      case TOGGLE_TODO:
        return state.map((todo, index) => {
          if (index === action.index) {
            return Object.assign({}, todo, {
              completed: !todo.completed
            })
          }
          return todo
        })
      default:
        return state
    }
  }
  ​
  function visibilityFilter(state = SHOW_ALL, action) {
    switch (action.type) {
      case SET_VISIBILITY_FILTER:
        return action.filter
      default:
        return state
    }
  }
  ​
  function todoApp(state = {}, action) {
    return {
      visibilityFilter: visibilityFilter(state.visibilityFilter, action),
      todos: todos(state.todos, action)
    }
  }
\`\`\`

每一个 reducer 都只管理属于自己那部分状态。而每一个 reducer 返回的状态都会成为 store 的一部分。这里我们需要通过 combineReducers() 来将这些 reducer 组合到一起

\`\`\`js
  import { combineReducers } from 'redux'
  ​
  const todoApp = combineReducers({
    visibilityFilter,
    todos
  })
  ​
  export default todoApp
\`\`\`

### Store

Store 就是一堆对象的集合。Store 包含以下功能：

- 保持应用中的状态
- 允许通过 getState 访问状态
- 允许通过 dispatch 更新状态
- 注册订阅者
- 取消注册的订阅者

\`\`\`js
  import { createStore } from 'redux'
  import todoApp from './reducers'
  const store = createStore(todoApp)
\`\`\`

createStore 具有一个可选参数，可以初始化 store 中的状态。这对于部分场景很重要，比如说内置入后端预先处理的数据，直接注入到 store 中，这样页面就避免了 ajax 请求的响应时间提升了页面显示速度，如果没有 SEO 要求的话，这种方式是一个成本非常低的提高首屏加载速度的方式，之前我在项目中使用过。

\`\`\`js
  const store = createStore(todoApp, window.STATE_FROM_SERVER)
\`\`\`

我们可以通过 dispatch 派发 action 对象来改变 store 内部存储的状态：

\`\`\`js
  import {
    addTodo,
    toggleTodo,
    setVisibilityFilter,
    VisibilityFilters
  } from './actions'
  ​
  // Log the initial state
  console.log(store.getState())
  ​
  // Every time the state changes, log it
  // Note that subscribe() returns a function for unregistering the listener
  const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
  )
  ​
  // Dispatch some actions
  store.dispatch(addTodo('Learn about actions'))
  store.dispatch(addTodo('Learn about reducers'))
  store.dispatch(addTodo('Learn about store'))
  store.dispatch(toggleTodo(0))
  store.dispatch(toggleTodo(1))
  store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))
  ​
  // Stop listening to state updates
  unsubscribe()
\`\`\`


### Redux 数据流

Redux 遵循严格的单向数据流。意味着所有的应用都要遵循相同逻辑来管理状态，也正因如此，代码变得更加清晰，易于维护。并且由于采用单一数据源。避免了 Flux 复杂而难以管理状态的问题。但是，会让开发人员觉得繁琐。需要定义非常多的 action 和 reducer。

基于 Redux 的应用中，数据的生命周期要遵循一下几步：

1. 通过 dispatch 派发 action 对象
2. store 执行通过 combineReducers 注册的 reducer，根据 action 的 type 做对应的状态更新
3. 通过 combineReducers 组合的 reducers 将所有 reducer 返回的状态集中到一个状态树中
4. store 将返回的新状态树保存起来

### 异步 action

当我们使用一个异步 api 的时候，一般会有两个阶段：发起请求，收到回应。

这两个阶段通常会更新应用的状态，因此你需要 dispatch 的 action 被同步处理。通常，对于 API 请求你希望 dispatch 三个不同的 action：

- 一个用于告诉 reducer 请求开始的 action (通常会设置一个 isFetching 标志告知 UI 需要显示一个加载动画)
- 一个用于告诉 reducer 请求成功的 action (这里我们需要将接收到的数据更新到 store 中，并重置 isFetching)
- 一个用于告诉 reducer 请求异常的 action (重置 isFetching，更新 store 中一个可以通知 UI 发生错误的状态)

\`\`\`js
  { type: 'FETCH_POSTS' }
  { type: 'FETCH_POSTS', status: 'error', error: 'Oops' }
  { type: 'FETCH_POSTS', status: 'success', response: { ... } }
\`\`\`

通常，我们需要在异步开始前和回调中通过 store.dispatch 来派发这些 action 来告知 store 更新状态。

> _**Note**: 这里要注意 action 派发的顺序。因为异步的返回时间是无法确定的。所以我们需要借助 Promise 或者 async/await Generator 来控制异步流，保证 dispatch 的 action 有一个合理的顺序。_

### 同步 action

对于同步 action，我们只需要在 action creator 中返回一个 action 纯对象即可。

\`\`\`js
  export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
  ​
  export function selectSubreddit(subreddit) {
    return {
      type: SELECT_SUBREDDIT,
      subreddit
    }
  }
\`\`\`

### Async Flow

Redux 仅支持同步的数据流，只能在中间件中处理异步。因此我们需要在 中间件中才能处理异步的数据流。

[Redux-Thunk](https://github.com/gaearon/redux-thunk) 是一个非常好的异步 action 处理中间件,可以帮我们处理异步 action 更加方便和清晰。

下面是一个通过 Redux-Thunk 处理异步 action 的例子：

\`\`\`js
  import fetch from 'cross-fetch'
  import thunkMiddleware from 'redux-thunk'
  import { createLogger } from 'redux-logger'
  import { createStore, applyMiddleware } from 'redux'
  import { selectSubreddit, fetchPosts } from './actions'
  import rootReducer from './reducers'
  ​
  const loggerMiddleware = createLogger()
  ​
  const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      loggerMiddleware // neat middleware that logs actions
    )
  )
  ​
  store.dispatch(selectSubreddit('reactjs'))
  store
    .dispatch(fetchPosts('reactjs'))
    .then(() => console.log(store.getState()))
  ​
  export const REQUEST_POSTS = 'REQUEST_POSTS'
  function requestPosts(subreddit) {
    return {
      type: REQUEST_POSTS,
      subreddit
    }
  }
  ​
  export const RECEIVE_POSTS = 'RECEIVE_POSTS'
  function receivePosts(subreddit, json) {
    return {
      type: RECEIVE_POSTS,
      subreddit,
      posts: json.data.children.map(child => child.data),
      receivedAt: Date.now()
    }
  }
  ​
  export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'
  export function invalidateSubreddit(subreddit) {
    return {
      type: INVALIDATE_SUBREDDIT,
      subreddit
    }
  }
  ​
  // Meet our first thunk action creator!
  // Though its insides are different, you would use it just like any other action creator:
  // store.dispatch(fetchPosts('reactjs'))
  ​
  export function fetchPosts(subreddit) {
    // Thunk middleware knows how to handle functions.
    // It passes the dispatch method as an argument to the function,
    // thus making it able to dispatch actions itself.
  ​
    return function (dispatch) {
      // First dispatch: the app state is updated to inform
      // that the API call is starting.
  ​
      dispatch(requestPosts(subreddit))
  ​
      // The function called by the thunk middleware can return a value,
      // that is passed on as the return value of the dispatch method.
  ​
      // In this case, we return a promise to wait for.
      // This is not required by thunk middleware, but it is convenient for us.
  ​
      return fetch(\`https://www.reddit.com/r/\${subreddit}.json\`)
        .then(
          response => response.json(),
          // Do not use catch, because that will also catch
          // any errors in the dispatch and resulting render,
          // causing a loop of 'Unexpected batch number' errors.
          // https://github.com/facebook/react/issues/6895
          error => console.log('An error occurred.', error)
        )
        .then(json =>
          // We can dispatch many times!
          // Here, we update the app state with the results of the API call.
  ​
          dispatch(receivePosts(subreddit, json))
        )
    }
  }
\`\`\`

### 中间件

在前面，我们看到，我们可以通过中间件来完成异步 action 处理。如果你使用过 express 或者 koa，那么就更容易理解中间件。中间件就是一些代码，会在接收到请求的时候作出回应。

Redux 的中间件解决的是和 express 或者 koa 完全不同的问题，但是原理上差不多。它提供一种第三方插件机制，来在 dispatch 和 reducer 之间做一些特殊处理。就像下面这样：

\`\`\`js
  const next = store.dispatch
  store.dispatch = function dispatchAndLog(action) {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
  }
\`\`\`

那么我们如何完成一个自己的中间件呢？下面是一个典型的例子：

\`\`\`js
  // 其中 next 就是 dispatch
  const logger = store => next => action => {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
  }
  ​
  const crashReporter = store => next => action => {
    try {
      return next(action)
    } catch (err) {
      console.error('Caught an exception!', err)
      Raven.captureException(err, {
        extra: {
          action,
          state: store.getState()
        }
      })
      throw err
    }
  }

  // 通过 appliMiddleware 来注册自己的中间件
  import { createStore, combineReducers, applyMiddleware } from 'redux'
​
  const todoApp = combineReducers(reducers)
  const store = createStore(
    todoApp,
    // applyMiddleware() tells createStore() how to handle middleware
    applyMiddleware(logger, crashReporter)
  )
\`\`\`
