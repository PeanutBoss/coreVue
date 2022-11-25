import { track, trigger } from "./effect";
import {reactive, Reactive, readonly} from './reactive'

function createGetter (isReadonly = false) {
  return function (target, key) {
    if (key === Reactive.IS_REACTIVE) {
      return !isReadonly
    } else if (key === Reactive.IS_READONLY) {
      return isReadonly
    }

    // 执行读取操作
    const res = Reflect.get(target, key)
    // readonly不需要收集依赖
    !isReadonly && track(target, key)

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 返回读取结果
    return res
  }
}

function isObject (value) {
  return typeof value === 'object' && value !== null
}

function createSetter () {
  return function (target, key, value) {
    // 执行赋值操作
    const res = Reflect.set(target, key, value)
    // 根据更新后的值触发依赖
    trigger(target, key)
    return res
  }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

// reactive的陷阱对象
export const baseHandler = {
  get,
  set
}

// readonly的陷阱对象
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key: any, value) {
    console.warn(`${key} 是只读的`)
    return true
  }
}
