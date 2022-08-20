/* 隐式修改数组长度的原型方法 - 屏蔽对length的读取 */

const arr = reactive([])
effect(() => {
  arr.push(1)
})
effect(() => {
  arr.push(1)
})

// 该操作会提示最大调用栈溢出
/*
* 问题的原因是 push 的调用会建姐读取length属性，所以需要屏蔽对length属性的读取，
*   从而避免它于副作用函数之间建立响应联系。
* 定义一个标记变量，shouldTrack，代表是否允许收集依赖
*   执行默认行为之前，先将标记变量shouldTrack设为false，禁止收集依赖。操作完成后，将标记变量shouldTrack
*   设置为true，允许收集依赖。
* */
let shouldTrack = true
function track (target, key) {
  if (!activeEffect || !shouldTrack) return
  // ...省略
}
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstance[method] = function (...args) {
    shouldTrack = false
    let res = originMethod.apply(this, args)
    shouldTrack = true
    return res
  }
})

