import { trackEffect, triggerEffect, isTracking } from './effect'
import { isObject } from '../share'
import { reactive } from './reactive'

class Ref {
  private _value: any
  private depsList: any
  public __v_isRef = true
  public _raw // 如果接收的是一个对象有用，用来保存原始值
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value
    this._raw = value
    this.depsList = new Set()
  }
  get value () {
    // 与reactive同样的问题，单独执行get操作时activeEffect的值为空
    if (isTracking()) {
      trackEffect(this.depsList)
    }
    // if (isObject(this._value)) {
    //   return reactive(this._value)
    // }
    return this._value
  }
  set value (value) {
    // 如果更新的值没有变化，则不执行操作（使用的时候可能有坑）
    if (value === this._raw) return
    value === 2 && console.log(value, this._value)
    // 应该先更新value，然后再触发依赖
    this._value = isObject(value) ? reactive(value) : value
    this._raw = value
    triggerEffect(this.depsList)
  }
}

export function isRef (value) {
  // 原始类型没遇这个属性，所以两次取反（isReactive同理）
  return !!value.__v_isRef
}

export function ref (value) {
 return new Ref(value)
}

export function unRef (ref) {
  if (isRef(ref)) return ref.value
  return ref
}

export function proxyRef (ref) {
  return new Proxy(
    ref,
    {
      get(target, key) {
        const result = Reflect.get(target, key)
        return unRef(result)
      },
      set (target, key, value) {
        const res = Reflect.get(target, key)
        if (isRef(res) && !isRef(value)) {
          return res.value = value
        }
        return Reflect.set(target, key, value)
      }
    }
    )
}
