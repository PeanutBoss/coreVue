import { track, trigger } from "./effect";
import {reactive, Reactive, readonly} from './reactive'

function createGetter (isReadonly = false, isShallow = false) {
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

    // 如果读取结果是对象且不是shallow，需要做嵌套处理
    if (isObject(res) && !isShallow) {
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

function notSetter (target, key: any, value) {
  console.warn(`${key} 是只读的`)
  return true
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

// reactive的陷阱对象
export const baseHandler = {
  get,
  set
}

// readonly的陷阱对象
export const readonlyHandler = {
  get: readonlyGet,
  set: notSetter
}

export const shallowReadonlyHandler = {
  get: shallowReadonlyGet,
  set: notSetter
}
