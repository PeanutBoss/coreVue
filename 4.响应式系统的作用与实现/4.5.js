/* 分支切换与cleanUp - 代码重构 */

const bucket = new WeakMap()

let activeEffect

const obj = new Proxy({}, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key)
  }
})

function track (target, key) {
  if (!activeEffect) return
  // 获取一个对象下保存 所有key对应的依赖集合 的Map：如{ key1: deps, key2: deps }
  let depsMap = bucket.get(target)
  if (!depsMap) { // 如果不存在
    depsMap = new Map() // 新建一个
    bucket.set(target, depsMap) // 并保存起来
  }
  // 获取对象下某个key对应的依赖集合
  let deps = depsMap.get(key)
  if (!deps) { // 如果不存在
    deps = new Set() // 新建一个
    deps.set(key, deps) // 并保存起来
  }
  // 将当前激活的副作用函数添加到依赖集合中
  deps.add(activeEffect)
}

function trigger (target, key) {
  // 取出target对应的depsMap
  const depsMap = bucket.get(target)
  // 取出key对应的依赖集合，如果没有直接return，因为没有依赖项
  if (!depsMap) return
  // 根据 key 取得所有副作用函数
  const deps = depsMap.get(key)
  // 执行所有依赖的副作用函数
  deps && deps.forEach(fn => fn())
}
