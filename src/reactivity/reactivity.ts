// 暂存当前的依赖项
let activeEffect
// 保存所有的依赖
let targetMap = new WeakMap()

// 创建一个依赖项
class ReactiveEffect {
  // 保存副作用函数
  private _fn
  constructor(fn) {
    this._fn = fn
  }
  run () {
    // 将当前实例暂存起来，方便track时收集
    activeEffect = this
    // 默认执行一次副作用函数
    this._fn()
  }
}

function effect (fn) {
  // 根据副作用函数创建一个依赖项
  const _effect = new ReactiveEffect(fn)
  // 调用这个依赖项的run方法
  _effect.run()
}

// 接收一个原始对象，返回一个它的响应式代理
function reactive (raw) {
  return new Proxy(
      raw,
      {
        // 响应式对象get操作的拦截方法
        get(target, key) {
          // 收集依赖
          track(target, key)
          // 返回读取结果
          return Reflect.get(target, key)
        },
        // 响应式对象set操作的拦截方法
        set(target: any, key, value) {
          // 先更新原始对象的值
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
  // 获取target对象所有key与key对应依赖集合的Map
  let keyDeps = targetMap.get(target)
  // 如果没有值
  if (!keyDeps) {
    // 创建
    keyDeps = new Map()
    // 以 key-value: target-keyDeps 形式保存到targetMap中
    targetMap.set(target, keyDeps)
  }
  // 获取key对应的所有依赖
  let dep = keyDeps.get(key)
  // 如果不存在
  if (!dep) {
    // 创建
    dep = new Set()
    // 将dep保存到keyDeps中
    keyDeps.set(key, dep)
  }
  // 单独读取响应式代理时（不是在函数中读取），activeEffect为undefined
  // 因此收集依赖时需要加判空操作
  if (!activeEffect) return
  // 将当前的依赖项保存起来
  dep.set(activeEffect)
}

// 触发依赖
function trigger (target, key) {
  // 与收集依赖同理
  const keyDeps = targetMap.get(target)
  const dep = keyDeps.get(key)
  // 找到key对应的依赖集合，遍历执行每个依赖的run方法
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
