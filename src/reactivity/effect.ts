import { extend } from '../share'

let activeEffect // 全局变量保存effect
let shouldTrack // 是否应该收集依赖

export class ReactiveEffect {
  private _fn: any
  private active: boolean = true // true的时候，说明依赖没有清除
  deps = []
  onStop?: () => void

  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run () {
    /*
    * stop状态：不收集依赖
    * */
    // 是否收集依赖用shouldTrack做区分
    if (!this.active) {
      return this._fn() // stop状态直接执行fn就可以了
    }
    /*
    * !stop状态：需要收集依赖
    * */
    shouldTrack = true // 不是stop状态应该将开关打开（不是stop状态，就让它可以收集依赖）
    activeEffect = this // 当前的effect实例
    const result = this._fn() // 执行fn，会触发响应式对象的get操作，在get操作中去收集依赖
    // 需要reset的操作
    shouldTrack = false // 重置为false，默认是不能收集依赖的
    return result
  }

  stop () {
    if (this.active) {
      cleanUpEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

// 删除依赖
function cleanUpEffect (effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  /*
  * 一个effect关联的所有依赖都在它的deps属性中
  * 所以清空一个effect的依赖就相当于让它的deps属性的长度为0
  * */
  effect.deps.length = 0
}

const targetMap = new Map() // 一个对象的所有依赖保存在这里面

/* 收集依赖 */
export function track (target, key) {
  /*
  * 优化点1：如果不需要收集依赖，下面的代码不需要执行了
  * */
  // if (!activeEffect) return
  // if (!shouldTrack) return
  if (!isTracking()) return

  // 收集依赖，这些依赖是唯一的（set数据结构）
  // target ---对应---> key ---对应---> dep
  let depsMap = targetMap.get(target) // 一个对象的key对应的所有依赖保存在这里面

  // 初始化
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

/*
* 抽离保存依赖的操作，方便ref复用
* 因为ref只有一个value值，所以不需要通过Map来收集多个属性的依赖
*   只需要一个set来保存value属性的依赖就行
* */
export function trackEffects (dep) {
  // 如果已经收集了，直接return掉
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking () {
  return shouldTrack && activeEffect !== undefined
}

export function effect (fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()

  // _effect.onStop = options.onStop
  // Object.assign(_effect, options)
  extend(_effect, options)

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

/* 触发依赖 */
export function trigger (target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects (dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function stop (runner) {
  runner.effect.stop()
}
