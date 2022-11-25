import { extend } from '../share'

// 暂存处于激活状态中的effect
let activeEffect
// 是否应该收集依赖，收集依赖的一个开关
let shouldTrack = false
// 保存所有对象的依赖
const targetMap = new Map()

class ReactiveEffect {
  private _fn: any
  depsList: any = []
  private active = true // 是否需要删除依赖的标识
  onStop: any
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run () {
    // 如果处于stop状态，直接执行fn且不收集依赖
    if (!this.active) {
      return this._fn()
    }
    activeEffect = this
    // 否则，打开收集依赖的开关
    shouldTrack = true
    const result = this._fn()
    // fn执行完毕后将开关关闭
    shouldTrack = false
    return result // 返回fn执行结果
  }
  stop () {
    // 如果依赖被删除，直接return
    if (!this.active) return
    // 将当前依赖从它所属的所有依赖集合中清除
    this.depsList.forEach(
      deps => deps.delete(this)
    )
    this.onStop && this.onStop()
    // 依赖被清除
    this.active = false
  }
}

// 收集依赖
export function track (target, key) {
  if (!isTracking()) return

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

  // 反向收集依赖集合（这个依赖项被哪些依赖集合收集）
  activeEffect.depsList.push(deps)
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

// 是否需要收集依赖
function isTracking () {
  /*
  * 收集依赖时activeEffect可能为undefined
  * 使用effect时会先执行一次传入的fn，执行fn之前会给activeEffect赋值为当前的依赖
  *   然后才触发它的get拦截方法，收集依赖没有问题
  * 但是直接做读取操作的时候，activeEffect就是undefined
  * */
  // if (!activeEffect) return
  // 如果是关闭状态就不收集依赖
  // if (!shouldTrack) return

  return shouldTrack && activeEffect !== undefined
}

// ---reactive--- 3.实现effect -> 4.收集依赖
export function effect (fn, options: any = {}) {
  // 创建effect实例
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 合并_effect和options
  // _effect.onStop = options.onStop
  extend(_effect, options)

  // 先调用一次fn
  _effect.run()

  // 返回runner，因为runner执行时会再次调用fn，所以返回effect的run方法即可
  // 因为 run 方法中的 activeEffect = this 要将 activeEffect 设置为当前的 effect，所以给它绑定this为_effect
  const runner: any = _effect.run.bind(_effect)
  // 把effect保存到runner中，供stop时使用
  runner.effect = _effect

  return runner
}

// 停止触发依赖
export function stop (runner) {
  runner.effect.stop()
}
