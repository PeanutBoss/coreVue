import { baseHandler, readonlyHandler } from './baseHandlers'

// ---reactive--- 2.实现reactive -> effect
export function reactive (raw) {
  return new Proxy(raw, baseHandler)
}

// get时不需要收集依赖，set给出警告
export function readonly (raw) {
  return new Proxy(raw, readonlyHandler)
}
