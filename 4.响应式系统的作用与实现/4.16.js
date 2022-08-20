/* watch - 过期的副作用 */

function watch (source, cb, options) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue
  // cleanup用来存储用户注册的过期回调
  let cleanup
  function onInvalidate(fn) {
    // 过期回调保存到cleanup中
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    // 调用回调函数cb之前，先调用过期回调
    if (cleanup) {
      cleanup()
    }
    // 将 onInvalidate 作为回调函数的第三个参数，以边用户使用
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effect(
    () => getter,
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = new Promise()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
}

// 使用
watch(obj, async (newValue, oldValue, onInvalidate) => {
  let expired = false
  onInvalidate(() => {
    expired = true
  })
  const res = await fetch('/path/to/request')
  if (!expired) {
    const finalData = res
  }
})

/*
* 每次触发watch执行回调时，都会产生一个闭包，里面保存了expired变量，用来标识是否更新finalData的值，默认为false。
*   下一次触发watch回调时，会先执行传入 onInvalidate 中的函数，将expired标识改为true，在上一次触发的回调函数中，
*   finalData将不会被重新赋值。
*
* 执行回调函数之前要先检查过期回调是否存在，如果存在会优先执行过期回调。（实际上就是修改闭包中的标志）
* */
