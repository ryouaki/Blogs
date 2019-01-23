```js
// 获取xpath
export function readXPath(element) {
  if (element.id !== '') { // 判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
    return `//*[@id="${element.id}"]`
  }
  // 这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
  if (element === document.body) { // 递归到body处，结束递归
    return '/html/' + element.tagName.toLowerCase()
  }

  let siblings = element.parentNode.childNodes// 同级的子元素
  siblings = Array.from(siblings).filter((sibling) => {
    return sibling.tagName === element.tagName
  })
  let len = siblings.length

  if (len === 1) {
    return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase()
  } else if (len > 1) {
    let ix = 1
    for (let i = 0; i < len; i++) {
      let sibling = siblings[i]
      if (sibling === element) {
        return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']'
      } else if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++
      }
    }
  }
}
```
