/* 计算属性 - 缓存 */

function computed (getter) {
  let value // 缓存上一次计算的值
  let dirty = true // 是否脏值，是就意味着需要重新计算

  const effectFn = effect(getter, {
    lazy: true
  })

  const obj = {
    get value () {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      return value
    }
  }
  return obj
}
const person = { age: 21, weight: 134 }
const sumRes = computed(() => person.age + person.weight)

/*
* 当通过 sumRes.value 访问值时，只有当dirty为true时才会调用effectFn重新计算值，否则直接使用上一次缓存在value
*   中的值。
* 但还存在一个问题，person.age或person.weight发生改变后，sumRes.value没有变化，因为当它们发生变化时，dirty没有
*   重置为true。
* */
