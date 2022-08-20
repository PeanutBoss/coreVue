/* 通过has拦截函数实现对in操作符的代理 */

/*
* for-in循环的核心方法 EnumerateObjectProperties
* 生成器函数，回送的值为属于对象自身属性的key
* */
function * EnumerateObjectProperties (obj) {
  const visited = new Set()
  // Reflect.ownKeys 获取只属于对象自身拥有的键
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key === 'symbol') continue
    const desc = Reflect.getOwnPropertyDescriptor(obj, key)
    if (desc) {
      visited.add(key)
      if (desc.enumerable) yield key
    }
  }

  // 原型
  const proto = Reflect.getPrototypeOf(obj)
  if (proto === null) return
  for (const protoKey of EnumerateObjectProperties(proto)) {
    if (!visited.has(protoKey)) yield protoKey
  }
}

/*
* for-in循环的核心就在于使用 Reflect.ownKeys 获取对象自身属性的key。
*   那么拦截ownKeys就可以拦截for-in循环。
* */
const obj = { foo: 1 }
const ITERATE_KEY = Symbol()

const p = new Proxy(obj, {
  ownKeys(target) {
    // 将副作用与 ITERATE_KEY 关联
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
})

