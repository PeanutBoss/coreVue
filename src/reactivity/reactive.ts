import { baseHandler, readonlyHandler } from './baseHandlers'

// ---reactive--- 2.实现reactive -> effect
export function reactive (raw) {
  return new Proxy(raw, baseHandler)
}

export enum Reactive {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

// get时不需要收集依赖，set给出警告
export function readonly (raw) {
  return new Proxy(raw, readonlyHandler)
}

export function isReactive (target) {
  return target[Reactive.IS_REACTIVE]
}

export function isReadonly (target) {
  return target[Reactive.IS_READONLY]
}
