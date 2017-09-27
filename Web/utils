```js
import moment from 'moment'
import _ from 'lodash';

export const translateDate = (e) => {
  if (e instanceof moment) {
    let date = e.format('YYYY-MM-DD');
    date = new Date(date);
    return date.getTime();
  } else {
    return e;
  }
}

export const updateState = (target, source) => {
  let newTarget = { ...target };
  for (let sKey in source) {
    if (source.hasOwnProperty(sKey)) {
      if (newTarget[sKey]) {
        if (newTarget.hasOwnProperty(sKey)) {
          if (_.isArray(source[sKey])&&_.isArray(newTarget[sKey])) {
            newTarget[sKey] = [].concat(source[sKey]);
          } else if (_.isFunction(source[sKey])&&_.isFunction(newTarget[sKey])) {
            newTarget[sKey] = source[sKey];
          } else if (_.isObject(source[sKey])&&_.isObject(newTarget[sKey])) {
            newTarget[sKey] = updateState(newTarget[sKey], source[sKey]);
          } else {
            newTarget[sKey] = source[sKey];
          }
        }
      } else {
        newTarget[sKey] = source[sKey];
      }
    }
  }
  return newTarget;
}

export const fullScreen = () => {
  let element = document.documentElement; // 若要全屏页面中div，let element= document.getElementById("divID");
  // IE 10及以下ActiveXObject
  if (window.ActiveXObject) {
    let WsShell = new ActiveXObject('WScript.Shell')
    WsShell.SendKeys('{F11}');
  } else if (element.requestFullScreen) { // HTML W3C 提议
    element.requestFullScreen();
  } else if (element.msRequestFullscreen) { // IE11
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullScreen) { // Webkit (works in Safari5.1 and Chrome 15)
    element.webkitRequestFullScreen();
  } else if (element.mozRequestFullScreen) { // Firefox (works in nightly)
    element.mozRequestFullScreen();
  }
}

export const fullExit = () => {
  let element = document.documentElement;// 若要全屏页面中div，let element= document.getElementById("divID"); 
  // IE ActiveXObject
  if (window.ActiveXObject) {
    let WsShell = new ActiveXObject('WScript.Shell')
    WsShell.SendKeys('{F11}');
  } else if (element.requestFullScreen) { // HTML5 W3C 提议
    document.exitFullscreen();
  } else if (element.msRequestFullscreen) { // IE 11
    document.msExitFullscreen();
  } else if (element.webkitRequestFullScreen) { // Webkit (works in Safari5.1 and Chrome 15)
    document.webkitCancelFullScreen();
  } else if (element.mozRequestFullScreen) { // Firefox (works in nightly)
    document.mozCancelFullScreen();
  }
}

export const isFullScreen = () => {
  return (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width);
}

export const isNumber = ( str ) => {
  let number = Number(str);
  if (!isNaN(number)) {
    return false;
  } else {
    return true;
  }
}

export const getQueryString = (queries) => {
  let ret = [];
  for (let key in queries) {
    if (typeof queries[key] !== 'string') {
      ret.push(key + '=' + encodeURIComponent(JSON.stringify(queries[key])));
    } else {
      ret.push(key + '=' + encodeURIComponent(queries[key]));
    }
  }

  return ret.length > 0 ? '?' + ret.join('&') : ret;
}

export const parseQueryString = (url) => {
  let obj = {};
  let keyvalue = [];
  let key = '';
  let value = '';
  let rootUrl = url.substring(0, url.indexOf('?'));
  let paraString = url.substring(url.indexOf('?') + 1, url.length).split('&');
  for (let i in paraString) {
    keyvalue = paraString[i].split('=');
    key = keyvalue[0];
    value = keyvalue[1];
    obj[key] = decodeURIComponent(value);
  }
  obj.rootUrl = rootUrl;
  return obj;
}

export const getUri = (route) => {
  return route.location&&route.location.pathname&&(route.location.pathname+route.location.search) || '';
}

export const formatMoney = function (number) {
  if (number === undefined) {
    return '';
  }
  let moneyStr = number + '';
    moneyStr = moneyStr.replace(/,/g,'');
  let floatNum = '';
  if (moneyStr.indexOf('.') >= 0) {
    floatNum = moneyStr.substr(moneyStr.indexOf('.'), moneyStr.length);
    moneyStr = moneyStr.substr(0, moneyStr.indexOf('.'));
  }
  let len = moneyStr.length; 
  let arr = []; 
  let num = Math.floor(len / 3);
  let firstLen = len % 3;
  let firstStr = moneyStr.substr(0, firstLen);
  if (firstStr.length > 0) {
    arr.push(firstStr);
  }
  for (let i = 0; i < num; i++) { 
    arr.push(moneyStr.substr(i * 3 + firstLen, 3))
  }
  return arr.join(',') + floatNum; 
}

export const getUUID = () => {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c==='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

export const getEnum = (arr, id) => {
  let ret = '';
  const index = arr.findIndex( (item) => {
    return item.id+'' === id+'';
  });

  if (index >= 0) {
    ret = arr[index].name;
  }

  return ret;
}

export const getReducerId = () => {
  return window.location.pathname + window.location.search;
}
```
