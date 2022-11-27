import { ReactiveEffect } from './effect'

// class ComputedOriginal {
//   private _value
//   private _getter // 懒执行（访问value属性的时候才有可能执行）
//   private _isClean = true // 表示当前是否需要清楚缓存
//   constructor(getter) {
//     this._getter = getter
//   }
//   get value () {
//     if (this._isClean) {
//       this._isClean = false
//       this._value = this._getter()
//       return this._value
//     }
//     return this._value
//   }
// }

class Computed {
  private _value
  private _getter // 懒执行（访问value属性的时候才有可能执行）
  private _isNeedClean = true // 表示当前是否需要清除缓存（是否重新计算）
  constructor(getter) {
    const effect = new ReactiveEffect(getter, () => {
      this._isNeedClean = true
    })
    // _getter保存的是runner
    this._getter = effect.run.bind(effect)
  }
  get value () {
    if (this._isNeedClean) {
      this._isNeedClean = false
      this._value = this._getter()
      return this._value
    }
    return this._value
  }
}

export function computed (getter) {
  return new Computed(getter)
}
