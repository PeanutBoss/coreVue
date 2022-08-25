// 抽离get
import {track, trigger} from "./effect";
import {reactive, ReactiveFlags, readonly} from './reactive'
import { isObject, extend } from '../share/index'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter (isReadonly = false, shallow = false) {
  return function get (target, key) {

    // console.log(key)
    // 如果访问的key是 is_reactive，就说明调用了isReactive
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 如果isReadonly是false，就说明它是一个reactive
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    /*
    * 检查是不是shallowReadonly，如果是（shallowReadonly包含两个条件：1.不需要嵌套 2.是readonly，不需要收集依赖），
    *   则不需要进行包装，直接返回res就可以
    * */
    if (shallow) {
      return res
    }

    /*
    * 检查res是不是 普通对象，如果是普通对象，使用reactive包装它并返回
    * readonly的嵌套也也是在这里实现，根据 isReadonly判断
    *   如果是 isReadonly === true 用readonly包装并返回，否则用reactive包装并返回
    *
    * 这块我自己有一个问题，就是在这里返回 res 下面收集依赖操作难道就不需要了吗？
    * 思考了下，答案是需要的，不过收集依赖并不是在这一层做的，因为它 res 是一个普通对象，
    *   所以在这里收集依赖是没有意义的，而且也收集不了，通过reactive包装之后，会在包装的这一层
    *   去收集依赖。
    * */
    if (isObject(res)) {
      // return reactive(res)
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 检查是否是reactive，如果是reactive，则需要收集依赖
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

// 抽离set
function createSetter () {
  return function set (target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandles = {
  get,
  set
}

export const readonlyHandles = {
  get: readonlyGet,
  set (target, key) {
    console.warn(`key: ${key} set 失败，因为target是readonly`, target)
    return true
  }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandles, {
  get: shallowReadonlyGet
})
