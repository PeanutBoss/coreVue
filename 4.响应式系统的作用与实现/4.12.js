/* 计算属性 - 调度器 */

const obj = { foo: 3, bar: 4 }
const sumRes = computed(() => obj.foo + obj.bar)

effect(() => {
  // 在副作用函数中读取 sumRes.value
  console.log(sumRes.value)
})
obj.foo++ // 修改obj.foo

/*
* 上面代码中，sumRes时一个计算属性，并且在另一个effect的副作用函数中读取了sumRes.value的值。
*   修改obj.foo，期望副作用函数重新执行，但是并没有。
*
* 本质上这时一个effect嵌套的问题。计算属性内部有自己的effect，并且时懒执行的，只有读取计算属性的值才会执行。
*   对于计算属性的getter来说，它里面访问的响应式数据只会把computed内部的effect收集为依赖。
*   而当把计算属性用于另一个effect时，就会发生effect嵌套，外层的effect不会背内层effect中的响应式数据收集。
*
* 解决：当读取计算属性的值时，可以手动调用track函数进行追踪，当计算属性依赖的响应式数据变化时，可以手动
*   调用trigger函数触发响应。
* 建立的联系：
*   obj
*     value
*       effectFn
* */

function computed (getter) {
  let value
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler () {
      if (!dirty) {
        dirty = true
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value () {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 当读取value时，手动调用 track 函数进行追踪
      track(obj, 'value')
      return value
    }
  }

  return obj
}
