class Promise {
  constructor(executor) { //executor执行器
    this.status = 'pending'; //默认等待状态
    this.value = undefined; //成功的值
    this.reason = undefined //失败的原用
    this.onResovleCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'resolved'; //成功
        this.value = value;
        this.onResovleCallbacks.forEach(fn => fn());
      }
    }
    let reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected'; //失败
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    }
    try {
      executor(resolve, reject); //默认上执行器执行
    } catch (e) { //捕获到异常时，直接走失败
      reject(e);
    }
  }
  then(onFufilled, onRejected) {
    onFufilled = typeof onFufilled === 'function' ? onFufilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
      throw err
    };

    function resolvePromise(promise2, x, resolve, reject) {
      //x可能是别人的promise，所以尽可能的允许别人瞎写
      if (promise2 === x) { //返回的结果和promise是同一个，那么永远不会成功
        return reject(new TypeError('循环引用'));
      }
      //
      let called;
      // 看x是不是promise。promise应该是一个对象
      if (x != null && (typeof x === 'object' || typeof x === 'function')) { //可能是promise
        try {
          let then = x.then; // 如果是对象 我就试着取一下then方法 如果有then，认为它是promise
          if (typeof then === 'function') { // then是函数，是promise
            then.call(x, y => {
              // 成功和失败只能调用一个
              if (called) return;
              called = true;
              // resolve的结果依旧是promise 那就继续解析
              resolvePromise(promise2, y, resolve, reject);
            }, r => {
              if (called) return;
              called = true;
              reject(r); // 失败了就失败了
            })
          } else {
            resolve(x); // 直接成功即可
          }
        } catch (e) { // 取then出错了那就不要在继续执行了
          if (called) return;
          called = true;
          reject(e);
        }
      } else { //普通值 让promise2直接变成成功态
        resolve(x);
      }
    };
    let promise2; //返回的新promise
    promise2 = new Promise((resolve, reject) => {
      if (this.status === 'resolved') {
        setTimeout(() => {
          try {
            let x = onFufilled(this.value); //x是上一个promise返回值，可能是一个普通值，也可能是一个promise；x也可能是别人的promise，我们可以写一个方法，统一处理
            resolvePromise(promise2, x, resolve, reject); //下一次then的实例promise2，这次返回值x，promise2的成功方法，promise2的失败方法
          } catch (e) {
            reject(e)
          }
        }, 0);
      }
      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === 'pending') {
        this.onResovleCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFufilled(this.value)
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0)
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0)
        })
      }
    });
    return promise2;
  }
}
module.exports = Promise;
