import { track, trigger } from "./effect";

function createGetter (isReadonly = false) {
  return function (target, key) {
      console.log(key, 'key---------------------')
    if (key === '__isReactive') {
      return !isReadonly
    } else if (key === '__isReadonly') {
      return isReadonly
    }

    // 执行读取操作
    const res = Reflect.get(target, key)
    // readonly不需要收集依赖
    !isReadonly && track(target, key)
    // 返回读取结果
    return res
  }
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
