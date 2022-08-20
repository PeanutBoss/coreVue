/* 避免无限递归循环 */

effect(() => obj.foo++)
/*
* 在effect注册的副作用函数内有一个自增操作 obj.foo++，该操作会引起栈溢出。
* 为什么呢？ obj.foo++ 等同于 obj.foo = obj.foo + 1
* 每次读取obj.foo的值，又会设置obj.foo的值。
*   首先读取 obj.foo 的值，会触发track操作收集依赖
*   接着将其加 1 在赋值给 obj.foo ，此时会触发trigger操作触发依赖
*   但问题是该副作用函数正在执行中，还没有执行完毕旧开始了下一次的执行
*   这样自己调用自己，旧产生了栈溢出
* 通过分析可以发现，读取和设置操作都是在同一个副作用函数中进行的，track收集和trigger触发的副作用函数
*   都是activeEffect。因此触发执行的副作用函数和当前执行的副作用函数相同，则不触发执行。
* */

function trigger (target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 触发执行的副作用函数和当前执行的副作用函数相同，则不触发执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => effectFn())
}
