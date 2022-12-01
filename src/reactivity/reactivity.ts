// 暂存当前的副作用函数
let activeEffect
// 保存所有的依赖
let targetMap = new WeakMap()

class ReactiveEffect {
  private _fn
  constructor(fn) {
    this._fn = fn
  }
  run () {
    activeEffect = this
    this._fn()
  }
}

function effect (fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

function reactive (raw) {
  return new Proxy(
      raw,
      {
        get(target, key) {
          // 收集依赖
          track(target, key)
          return Reflect.get(target, key)
        },
        set(target: any, key, value) {
          const res = Reflect.set(target, key, value)
          // 触发依赖
          trigger(target, key)
          return res
        }
      }
  )
}

// 收集依赖
function track (target, key) {
  let keyDeps = targetMap.get(target)
  if (!keyDeps) {
    keyDeps = new Map()
    targetMap.set(target, keyDeps)
  }
  let dep = keyDeps.get(key)
  if (!dep) {
    dep = new Set()
    keyDeps.set(key, dep)
  }
  // 单独读取响应式代理时（不是在函数中读取），activeEffect为undefined
  if (!activeEffect) return
  dep.set(activeEffect)
}

// 触发依赖
function trigger (target, key) {
  const keyDeps = targetMap.get(target)
  const dep = keyDeps.get(key)
  for (const effect of dep) {
    effect.run()
  }
}

class Ref {
  constructor(value) {

  }
}

function ref () {

}
