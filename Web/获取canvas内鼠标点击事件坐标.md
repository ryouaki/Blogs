```js
  var canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  
  point.x = (event.clientX - rect.left) * (canvas.width / rect.width);
  point.y = (event.clientY - rect.top) * (canvas.height / rect.height);
```
