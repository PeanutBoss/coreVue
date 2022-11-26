import { baseHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandlers'

// ---reactive--- 2.实现reactive -> effect
export function reactive (raw) {
  return new Proxy(raw, baseHandler)
}

export enum Reactive {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadOnly'
}

// get时不需要收集依赖，set给出警告
export function readonly (raw) {
  return new Proxy(raw, readonlyHandler)
}

export function isReactive (target) {
  return !!target[Reactive.IS_REACTIVE]
}

export function isReadOnly (target) {
  // 检测普通对象是会返回undefined，所以进行两次取反
  return !!target[Reactive.IS_READONLY]
}

// 只要是readonly或reactive，就是proxy
export function isProxy (target) {
  return isReadOnly(target) || isReactive(target)
}

export function shallowReadonly (raw) {
  return new Proxy(raw, shallowReadonlyHandler)
}
