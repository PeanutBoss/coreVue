/* 数组的响应式 - 通过索引修改数组 */

/*
* 通过索引设置元素值时，可能会隐式地修改 length 地属性值，因此触发响应时也应该触发与
*   length属性相关的副作用函数重新执行。
* */

function createReactive (obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性${key}是只读地`)
        return true
      }
      const oldValue = target[key]
      const type = Array.isArray(target)
        // 如果目标对象时数组，则检测被设置地索引值是否小于数组长度，如果是则视为SET操作，否则是ADD操作
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target !== newVal && (oldValue === oldValue || newVal === newVal)) {
        trigger(target, key, type)
      }
      return res
    }
  })
}

function trigger (target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  // ...省略

  /*
  * 当操作类型为ADD并且目标对象是数组时，应该取出并执行那些与 length 属性关联地副作用函数
  * */
  if (type ==='ADD' && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach(effectFn => {
      effectsToRun.add(effectFn)
    })
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
