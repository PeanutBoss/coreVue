import { track, trigger } from './effect'

// ---reactive--- 2.实现reactive -> effect
export function reactive (raw) {
  return new Proxy(raw, {
    get(target, key) {
      // 执行读取操作
      const res = Reflect.get(target, key)
      // 收集依赖
      track(target, key)
      // 返回读取结果
      return res
    },
    set(target, key, value) {
      // 执行赋值操作
      const res = Reflect.set(target, key, value)
      // 根据更新后的值触发依赖
      trigger(target, key)
      return res
    }
  })
}

// ---reactive--- 2.实现reactive -> effect
// export function reactive (raw) {
//   return new Proxy(raw, {
//     get(target, key) {
//       track(target, key)
//       return Reflect.get(target, key)
//     },
//     set(target, key, value) {
//       trigger(target, key)
//       return Reflect.set(target, key, value)
//     }
//   })
// }
