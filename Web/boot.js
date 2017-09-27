```js
/*
 * 用于动态设置html标签的font-size大小，用于自适应各种屏幕尺寸。
 */

((root) => {

    // 获取屏幕可视宽度，并设置html标签的font-size。
    let initRootFontSize = () => {
        let rootFontSize = 0;
        let width = document.body.clientWidth;
        let html = document.getElementsByTagName('html')[0];

        rootFontSize = width / 80; // 一般来讲，各种移动设备的屏幕宽度都是80的整数倍。
        html.style.fontSize = rootFontSize + 'px';
    }

    // 需要在用户调整浏览器大小的时候自适应。
    let resizeCallback = () => {
        initRootFontSize();
    }

    // 注册浏览器缩放的事件。
    window.addEventListener('resize', resizeCallback, false);

    // 添加到全局环境下。
    root.ryou = {
        initRootFontSize
    }

    // 在程序启动就设置html标签的font-size。
    initRootFontSize();


})(window || global);
```
