这是基于6.x进行的测试，如今8.x大约有3倍左右的提升

Test 1
```js
"use strict";

const TEST_SIZE = 1000000;

let arr1 = (new Array(TEST_SIZE)).fill(1);
let target1 = [];
let iStart1 = (new Date()).getTime();
console.log(process.memoryUsage());
for (let i=0; i < arr1.length; i++) {
    target1.push(arr1[i]);
}
let iEnd1 = (new Date()).getTime();
console.log(process.memoryUsage());
console.log((iEnd1 - iStart1)+'ms');
```
Result 1
```
{ rss: 27291648, heapTotal: 18501632, heapUsed: 11963728 }
{ rss: 61005824, heapTotal: 49152000, heapUsed: 43912704 }
293ms
```

Test 2
```js
"use strict";

const TEST_SIZE = 1000000;

let arr2 = (new Array(TEST_SIZE)).fill(1);
let target2 = [];
let iStart2 = (new Date()).getTime();
console.log(process.memoryUsage());
arr2.forEach(function(item){
    target2.push(item);
});
let iEnd2 = (new Date()).getTime();
console.log(process.memoryUsage());
console.log((iEnd2 - iStart2)+'ms');
```
Result 2
```
{ rss: 27332608, heapTotal: 18501632, heapUsed: 11963384 }
{ rss: 93376512, heapTotal: 81514496, heapUsed: 75770696 }
548ms
```

Test 3
```js
"use strict";

const TEST_SIZE = 1000000;

let arr3 = (new Array(TEST_SIZE)).fill(1);
let target3 = [];
let iStart3 = (new Date()).getTime();
console.log(process.memoryUsage());
arr3.map(function(item){
    target3.push(item);
});
let iEnd3 = (new Date()).getTime();
console.log(process.memoryUsage());
console.log((iEnd3 - iStart3)+'ms');
```
Result 3
```
{ rss: 27275264, heapTotal: 18501632, heapUsed: 11963384 }
{ rss: 93249536, heapTotal: 81514496, heapUsed: 75770696 }
588ms
```

Test 4
```js
"use strict";

const TEST_SIZE = 1000000;

let arr4 = (new Array(TEST_SIZE)).fill(1);
let target4 = [];
let iStart4 = (new Date()).getTime();
let index = 0;
console.log(process.memoryUsage());
while(index < arr4.length) {
    target4.push(arr4[index]);
    index++
}
let iEnd4 = (new Date()).getTime();
console.log(process.memoryUsage());
console.log((iEnd4 - iStart4)+'ms');
```
Result 4
```
{ rss: 27279360, heapTotal: 18501632, heapUsed: 11963416 }
{ rss: 61001728, heapTotal: 49152000, heapUsed: 43911648 }
294ms
```

Test 5
```js
"use strict";

const TEST_SIZE = 1000000;

let arr5 = (new Array(TEST_SIZE)).fill(1);
let target5 = [];
let iStart5 = (new Date()).getTime();
console.log(process.memoryUsage());
for (let obj in arr5) {
    target5.push(arr5[obj]);
}
let iEnd5 = (new Date()).getTime();
console.log(process.memoryUsage());
console.log((iEnd5 - iStart5)+'ms');
```
Result 5
```
{ rss: 27316224, heapTotal: 18501632, heapUsed: 11963568 }
{ rss: 115802112, heapTotal: 89677824, heapUsed: 83911776 }
728ms
```
