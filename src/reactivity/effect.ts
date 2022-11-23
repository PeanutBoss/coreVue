class ReactiveEffect {
  private _fn: any
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run () {
    // 用全局变量 activeEffect 保存当前的 effect 实例，收集依赖时使用
    activeEffect = this
    return this._fn()
  }
}

// 暂存处于激活状态中的effect
let activeEffect
// 保存所有对象的依赖
const targetMap = new Map()

// 收集依赖
export function track (target, key) {
  // 获取 target 对象对应的依赖，也是一个Map，这个Map保存着这个对象所有key的依赖
  let keyMap = targetMap.get(target)
  // 如果这个对象还没有对应的依赖，则创建并添加到 targetMap 中
  if (!keyMap) {
    keyMap = new Map()
    targetMap.set(target, keyMap)
  }

  // 获取target对象的 key 属性对应的依赖，是一个Set（避免依赖重复收集）
  let deps = keyMap.get(key)
  // 如果这个target对象的 key 属性没有对应的依赖，则创建并添加到 keyMap 中
  if (!deps) {
    deps = new Set()
    keyMap.set(key, deps)
  }
  // 将这个 effect 实例添加到这个 key 的依赖集合中
  deps.add(activeEffect)
}

// 触发依赖
export function trigger (target, key) {
  // 获取 target 对象的依赖
  const keyMap = targetMap.get(target)
  // 获取target对象的 key 属性对应的依赖
  const deps = keyMap.get(key)
  // 触发所有依赖
  for (const effect of deps) {
    // 如果有调度器方法则执行，否则直接执行run方法
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// ---reactive--- 3.实现effect -> 4.收集依赖
export function effect (fn, options: any = {}) {
  // 创建effect实例
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 先调用一次fn
  _effect.run()

  // 返回runner，因为runner执行时会再次调用fn，所以返回effect的run方法即可
  // 因为 run 方法中的 activeEffect = this 要将 activeEffect 设置为当前的 effect，所以给它绑定this为_effect
  return _effect.run.bind(_effect)
}
