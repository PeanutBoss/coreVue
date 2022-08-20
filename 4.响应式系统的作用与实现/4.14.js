/* watch - newValue & oldValue */

function watch (source, cb) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  // 定义新值与旧值
  let oldValue, newValue
  // 使用effect注册副作用函数，开启lazy懒执行，把返回值存储到effectFn中便于以后手动调用
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler () {
        // scheduler中重新执行effectFn函数，得到的是新值
        newValue = effectFn()
        // 将新值和旧值作为回调函数参数
        cb(newValue, oldValue)
        // 更新旧值
        oldValue = newValue
      }
    }
  )
  // 手动调用副作用函数，拿到的值是旧值
  oldValue = effectFn()
}

/*
* 手动执行effectFn函数得到旧值，即第一次执行的值。发生变化并触发scheduler调度函数执行时，
*   会重新调用effectFn函数并得到新值。
* */
