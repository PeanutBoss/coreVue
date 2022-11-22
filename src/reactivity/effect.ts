class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn
  }
  run () {
    activeEffect = this
    this._fn()
  }
}

let activeEffect
// 保存所有对象所有key对应的dep
const targetMap = new Map()

// 收集依赖
export function track (target, key) {
  let keyMap = targetMap.get(target)
  if (!keyMap) {
    keyMap = new Map()
    targetMap.set(target, keyMap)
  }

  let deps = keyMap.get(key)
  if (!deps) {
    deps = new Set()
    keyMap.set(key, deps)
  }
  deps.add(activeEffect)
}

// 触发依赖
export function trigger (target, key) {
  const keyMap = targetMap.get(target)
  const deps = keyMap.get(key)
  for (const effect of deps) {
    console.log(effect.run, 'effect')
    effect.run()
  }
}

// ---reactive--- 3.实现effect -> 4.收集依赖
export function effect (fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}
