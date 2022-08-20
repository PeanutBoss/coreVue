/* 数组的响应式 - 通过length修改数组 */

/*
* 修改数组地 length 属性也会隐式地影响数组元素
* 判断需要操作的目标是否是数组
*  如果是，则需要找到所有索引值大于或等于新的length值的元素，然后把他们相关联的副作用函数取出并执行
* */

const arr = reactive(['foo'])
effect(() => {
  console.log(arr[0])
})
arr.length = 0

function createReactive (obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性${key}是只读地`)
        return true
      }
      const oldValue = target[key]
      const type = Array.isArray(target)
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target !== newVal && (oldValue === oldValue || newVal === newVal)) {
        // 增加第四个参数，即触发响应地新值
        trigger(target, key, type, newVal)
      }
      return res
    }
  })
}

// 接收第四个参数 newVal，即新值
function trigger (target, key, type, newVal) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  // ...省略

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === 'length') {
    /*
    * 对于索引大于或等于 length 值的元素
    * 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中等待执行
    * */
    depsMap.forEach(effects => {
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
      }
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
