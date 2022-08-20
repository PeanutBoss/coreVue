/* 正确的触发依赖 */

/*
* 1.调用 trigger 函数触发响应之前，需要检查值是否真的发生了变化
*   而且需要保证它们都不是NaN
* 2.
* */

const obj = { foo: 1 }
const p = new Proxy(obj, {
  set(target, key, newVal, receiver) {
    // 先获取旧值
    const oldVal = target[key]
    const type = Object.prototype.hasOwnProperty(target, key) ? 'set' : 'add'
    const res = Reflect.set(target, key, newVal, receiver)
    // 比较新旧值，只有不全等且部位NaN的时候猜触发响应
    if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
      trigger(target, key, type)
    }
    return res
  }
})
