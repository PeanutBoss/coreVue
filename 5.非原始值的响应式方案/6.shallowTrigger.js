/* 浅响应式对象、浅只读 */

function createReactive (obj, isShallow = false, isReadonly) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      // 只读的响应式对象不需要收集依赖
      if (!isReadonly) {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      // 如果是浅响应，直接返回原始值
      if (isShallow) {
        return  res
      }
      // 返回的对象需要被reactive包装为一个响应式对象
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      // 其他类型也直接返回
      return  res
    },
    set(target, key, newVal, receiver) {
      // 只读则发出警告
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
      }
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver) {
        if (oldVal !== oldVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type)
        }
      }
      return res
    },
    deleteProperty(target, key) {
      // 只读则发出警告
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return true
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)

      if (res && hadKey) {
        trigger(target, key, 'DELETE')
      }
      return  res
    }
  })
}

function shallowReactive (obj) {
  return createReactive(obj, true)
}

function reactive (obj) {
  return createReactive(obj)
}

function ShallowReadonly (obj) {
  return createReactive(obj, true, true)
}

function readonly (obj) {
  return createReactive(obj, false, true)
}
