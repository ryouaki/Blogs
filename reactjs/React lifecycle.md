# React 

[](https://github.com/ryouaki/Blogs/blob/master/reactjs/ajs-life.png)

## 生命周期
- componentDidMount 在组件初始化的时候执行该函数，这里适合请求网络数据，在这里更改state会导致render。
- componentWillReceiveProps 当组件接受到一个新值的时候执行，即使在props没有更新的时候，但是父组件导致了该子组件调用这个api，所以要判断props是否真的改变再进行操作。在这里更改state并不会导致render。
- shouldComponentUpdate 可以判断这次render是不是由于state和props改变引起的，默认行为是根据每一次状态的修改而重新render。该函数在render之前调用，且在初次render和forceUpdate()的时候是不被调用的。并不阻止子组件由于state／props变更引起的render。
	    默认返回true，如果返回了false，那么componentWillUpdate, render, and componentDidUpdate就不会被执行了。
- componentWillUpdate 在render之前，当接受到新的state／props的时候被执行，可以在这里针对render之前的内容做一些设置。在初次mount的时候，是不被执行的。在该api内不能对state进行设置。
- componentDidUpdate 当update完成以后被执行，在初次mount的时候不被执行。这里是一个非常好的进行dom操作的地方。
- componentWillUnmount 在组件被卸载销毁以前执行，在这里进行一些clean操作，比如removeevent，cleartimer等等。
- setState 更新state的值，此操作为异步操作，并且会导致render被执行。第二个callback参数会在render执行后被调用，通常我们建议你在componentDidUpdate做这些。
- forceUpdate 默认情况下，render会因为state和props的更新而被调用，但是某些时候我们想执行render，但是又不更新state和props的时候可以通过调用该api促使render跳过shouldComponentUpdate被强制执行。并且会促发component的生命周期函数。一般情况下，我们不建议使用该函数。
- defaultProps 指定一个component的props的默认值，在es6语法下 static defaultProps = { propsName: value};
- displayName 用于设置debug的时候的message。
- propTypes 用于规定props属性的类型，static propTypes = { propsName: React.PropTypes.string}; 具体的类型参见
```js
* React.PropTypes。
* React.PropTypes.array
* React.PropTypes.bool
* React.PropTypes.func
* React.PropTypes.number
* React.PropTypes.object
* React.PropTypes.string
* React.PropTypes.symbol
* React.PropTypes.node
* React.PropTypes.element
* React.PropTypes.instanceOf()
* React.PropTypes.oneOf()
* React.PropTypes.oneOfType()
* React.PropTypes.arrayOf()
* React.PropTypes.objectOf()
* React.PropTypes.shape()
* React.PropTypes.any
* React.PropTypes
```
- render 该函数必须返回一个单一的React元素。当然你也可以return null或者false。在这里不能更改state和props。
- constructor 该函数在mount之前被执行，可以在所有执行语句之前执行super(props),除非你允许props的值可以为undefined，在这里我们也可以初始化state，this.state={key:value};
- isRequired 该属性是必须值，static contextTypes = { propsName: React.PropTypes.string.isRequired}
