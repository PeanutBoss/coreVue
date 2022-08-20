/* watch - 执行时机（immediate / flush） */

function watchImmediate (source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler: job
    }
  )
  oldValue = effectFn()

  // 如果需要立即执行
  if (options.immediate) {
    // 由于时立即执行的，所以第一次回调执行时oldValue是undefined
    job()
  } else {
    oldValue = effectFn()
  }
}

/*
* flush: 'pre' | 'async' | 'post'
* post实际上代表调度函数需要将副作用函数放到一个微任务队列中，并等待DOM更新结束后再执行
* */

function watch () {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        // 判断flush是否为'post'，如果是，将其放到微任务队列中执行
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
  oldValue = effectFn()

  // 如果需要立即执行
  if (options.immediate) {
    // 由于时立即执行的，所以第一次回调执行时oldValue是undefined
    job()
  } else {
    oldValue = effectFn()
  }
}
