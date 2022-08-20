/* 调度执行 - scheduler */

/*
* 输出顺序 - 传入scheduler，在响应式对象触发依赖的时候，可以将控制权交给用户
* */

/*
* 控制执行次数
* */
const jobQueue = new Set()
// 创建一个Promise实例，用它将一个任务添加到微任务队列
const p = Promise.resolve()
// 标识是否正在刷新微任务队列
let isFlushing = false
function flushJob () {
  // 如果正在刷新
  if (isFlushing) return
  // 设置为true
  isFlushing = true
  // 在微任务队列中刷新jobQueue队列
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    // 结束后重置flushing
    isFlushing = false
  })
}

effect(() => {
  console.log(obj.foo)
},{
  scheduler () {
    // 每次调度时，将副作用函数添加到 jobQueue 队列中
    jobQueue.add(fn)
    // 调用 flushJob 刷新队列
    flushJob()
  }
})
