const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class MyPromise {
  constructor(executor) {
    this.callbacks = [];
    this.state = STATE.PENDING;
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    this.finallyCallback = null;
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.state === STATE.PENDING) {
      this.state = STATE.FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback(value));
      this.executeFinally();
    }
  }

  reject(reason) {
    if (this.state === STATE.PENDING) {
      this.state = STATE.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => callback(reason));
      this.executeFinally();
    }
  }
  executeFinally() {
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.executeFinally(); // 在 then 的最后执行 finally
        }
      };
      const handleRejected = () => {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.executeFinally(); // 在 then 的最后执行 finally
        }
      };
      if (this.state === STATE.FULFILLED) {
        handleFulfilled();
      } else if (this.state === STATE.REJECTED) {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    this.finallyCallback = callback;
    return this;
  }

  static resolve(value) {
    if (value && value instanceof MyPromise) {
      return value;
    } else if (
      value &&
      typeof value === "object" &&
      typeof value.then === "function"
    ) {
      let then = value.then;
      return new MyPromise((resolve) => {
        then(resolve);
      });
    } else if (value) {
      return new MyPromise((resolve) => resolve(value));
    } else {
      return new MyPromise((resolve) => resolve());
    }
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const rets = new Array(promises.length);
      let fulfilledCount = 0;

      promises.forEach((MyPromise, index) => {
        MyPromise.resolve(MyPromise).then(
          (result) => {
            rets[index] = result;
            fulfilledCount++;

            if (fulfilledCount === promises.length) {
              resolve(rets);
            }
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      let overCount = promises.length;
      const rets = [];
      promises.forEach((MyPromise, index) => {
        MyPromise.resolve(MyPromise)
          .then(
            (result) => {
              overCount++;
              rets[index] = { status: "fulfilled", value: result };
            },
            (reason) => {
              overCount++;
              rets[index] = { status: "rejected", reason: reason };
            }
          )
          .finally(() => {
            if (!--overCount) {
              resolve(rets);
            }
          });
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      let settled = false;
      promises.forEach((promises) => {
        MyPromise.resolve(promises).then(
          (result) => {
            if (!settled) {
              settled = true;
              resolve(result);
            }
          },
          (reason) => {
            if (!settled) {
              settled = true;
              reject(reason);
            }
          }
        );
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const rejecteds = [];
      let count = 0;
      promises.forEach((promises) => {
        MyPromise.resolve(promises)
          .then(
            (result) => {
              resolve(result);
            },
            (reason) => {
              rejecteds.push(reason);
            }
          )
          .finally(() => {
            count++;
            if (count === promises.length) {
              // 如果全部失败，则 reject
              if (rejecteds.length === promises.length) {
                reject(
                  new AggregateError(rejecteds, "All promises were rejected")
                );
              }
            }
          });
      });
    });
  }
  static try(fn) {
    return new MyPromise((resolve, reject) => {
      try {
        const result = fn(); // 执行传入的函数
        // 如果函数返回值是 PromiseMini，则直接返回该 MyPromise
        if (result instanceof MyPromise) {
          result.then(resolve, reject); // 处理 MyPromise 的成功和失败
        } else {
          resolve(result); // 如果返回值是普通值，直接 resolve
        }
      } catch (error) {
        reject(error); // 如果函数执行中抛出异常，reject 该异常
      }
    });
  }
}
