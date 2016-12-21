1.-webkit-tap-highlight-color

-webkit-tap-highlight-color:rgba(0,0,0,0);//透明度设置为0，去掉点击链接和文本框对象时默认的灰色半透明覆盖层(iOS)或者虚框(Android)

-webkit-tap-highlight-color:rgba(255,0,0,0.5); //利用此属性，设置touch时链接区域高亮为50%的透明红，只在ios上起作用。android上只要使用了此属性就表现为边框。在body上加此属性，这样就保证body的点击区域效果一致了

2.outline：none

(1)在pc端为a标签定义这个样式的目的是为了取消ie浏览器下点击a标签时出现的虚线。ie7及以下浏览器还不识别此属性，需要在a标签上添加hidefocus="true"

(2)input，textarea{outline:none} 取消chrome下默认的文本框聚焦样式

(3)在移动端是不起作用的，想要去除文本框的默认样式可以使用-webkit-appearance，聚焦时候默认样式的取消是-webkit-tap-highlight-color。看到一些移动端reset文件加了此属性，其实是多余。

3.-webkit-appearance

-webkit-appearance: none;//消除输入框和按钮的原生外观，在iOS上加上这个属性才能给按钮和输入框自定义样式

不同type的input使用这个属性之后表现不一。text、button无样式，radio、checkbox直接消失

4.-webkit-user-select

-webkit-user-select: none; // 禁止页面文字选择 ，此属性不继承，一般加在body上规定整个body的文字都不会自动调整

5.-webkit-text-size-adjust

-webkit-text-size-adjust: none; //禁止文字自动调整大小(默认情况下旋转设备的时候文字大小会发生变化)，此属性也不继承，一般加在body上规定整个body的文字都不会自动调整

6.-webkit-touch-callout

-webkit-touch-callout:none; // 禁用长按页面时的弹出菜单(iOS下有效) ,img和a标签都要加

7.-webkit-overflow-scrolling

-webkit-overflow-scrolling:touch;// 局部滚动(仅iOS 5以上支持)
