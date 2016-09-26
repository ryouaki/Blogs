## Component Lifecycle

Components have three main parts of their lifecycle:

* **Mounting:** A component is being inserted into the DOM.
* **Updating:** A component is being re-rendered to determine if the DOM should be updated.
* **Unmounting:** A component is being removed from the DOM.

React provides lifecycle methods that you can specify to hook into this process. We provide **will** methods, which are called right before something happens, and **did** methods which are called right after something happens.

### Mounting

* `getInitialState(): object` is invoked before a component is mounted. Stateful components should implement this and return the initial state data.
* `componentWillMount()` is invoked immediately before mounting occurs.
* `componentDidMount()` is invoked immediately after mounting occurs. Initialization that requires DOM nodes should go here.

### Updating

* `componentWillReceiveProps(object nextProps)` is invoked when a mounted component receives new props. This method should be used to compare `this.props` and `nextProps` to perform state transitions using `this.setState()`.
* `shouldComponentUpdate(object nextProps, object nextState): boolean` is invoked when a component decides whether any changes warrant an update to the DOM. Implement this as an optimization to compare `this.props` with `nextProps` and `this.state` with `nextState` and return `false` if React should skip updating.
* `componentWillUpdate(object nextProps, object nextState)` is invoked immediately before updating occurs. You cannot call `this.setState()` here.
* `componentDidUpdate(object prevProps, object prevState)` is invoked immediately after updating occurs.

### Unmounting

* `componentWillUnmount()` is invoked immediately before a component is unmounted and destroyed. Cleanup should go here.

### Mounted Methods

_Mounted_ composite components also support the following method:

* `component.forceUpdate()` can be invoked on any mounted component when you know that some deeper aspect of the component's state has changed without using `this.setState()`.

## Browser Support

React supports most popular browsers, including Internet Explorer 9 and above.

(We don't support older browsers that don't support ES5 methods, but you may find that your apps do work in older browsers if polyfills such as [es5-shim and es5-sham](https://github.com/es-shims/es5-shim) are included in the page. You're on your own if you choose to take this path.)
