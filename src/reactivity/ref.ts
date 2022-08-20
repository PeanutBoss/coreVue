import { trackEffects, triggerEffects, isTracking, } from './effect'
import { hasChange, isObject } from "../share";
import {reactive} from "./reactive";

/*
* 创建一个ref的类
* */
class RefImpl {
  private _value: any
  public dep: any
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    // 如果这个value是一个对象，那么需要通过reactive给它进行包装
    // 1.检查value是不是对象
    this._value = convert(value)
    this._rawValue = value

    // this._value = value
    this.dep = new Set()
  }
  get value () {
    trackRefValue(this)
    return this._value
  }
  set value (newValue) {
    /*
    * newValue -> this._value，如果相等不需要执行操作
    * todo 抽离成hasChange
    * */
    // if (Object.is(newValue, this._value)) return
    /*
    * 对比的时候呢，是需要对两个原始值进行对比，而如果value是一个对象的话，this._value就成了reactive
    *   所以传入的value如果是对象，在对比前需要将reactive转为原始对象
    * 解决办法：初始化RefImpl的时候，声明一个值（_rawValue）保存传入的value，对比的时候就使用_rawValue对比
    * */
    if (hasChange(newValue, this._rawValue)) {
      // 一定需要先去修改value，再去触发依赖
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert (value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue (ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref (value) {
  return new RefImpl(value)
}

// 判断传入的值是不是ref
export function isRef (ref) {
  // 如果传入的是一个原始数据类型，那么将返回undefined，所以通过取反两次将其转为布尔值
  return !!ref.__v_isRef
}

// 传入一个ref数据，返回它的原始值
export function unRef (ref) {
  // 如果是ref，返回它的value属性，否则直接返回就可以
  return isRef(ref) ? ref.value : ref
}

// 代理ref，比如在vue模板（template）中使用ref时，不需要.value
export function proxyRef (objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get (target, key) {
      return unRef(Reflect.get(target, key))
    },
    /*
    * set的时候判断它是不是ref类型，如果是ref类型，那么需要修改它的value属性
    * */
    set (target, key, value) {
      /*
      * 当前的值是ref 且 将要更新的值不是ref的时候，需要给当前值（target[value]）的value属性赋值
      * 否则直接给这个当前值取赋值就可以（这个重点在于当前值（target[key]）是不是ref，如果不是那么做简单的赋值操作就可以）
      *   1.在当前值不是一个ref，将要更新的值是ref，也是直接赋值：target[key] = value
      *   2.两个都不是ref的情况下，简单赋值就可以：target[key] = value
      * 在当前值（target[key]）是一个ref，将要更新的值也是ref的情况下（两个值都是引用类型），
      *     需要修改的就是target[key]的指针，要做的操作也是：target[key] = value
      * */
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
