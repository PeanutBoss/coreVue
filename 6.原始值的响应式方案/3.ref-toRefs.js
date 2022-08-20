/* 解构导致的响应丢失 - 封装toRef、toRefs */

function toRef (obj, key) {
  const wrapper = {
    get value () {
      return obj[key]
    }
  }
  return wrapper
}

// 如果响应式数据的 键 非常多，可以使用封装的toRefs函数
function toRefs (obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}

// 版本2 - 为了概念上的统一，将通过toRef或toRefs转换后得到的结果视为真正的ref数据
function toRefV2(obj, key) {
  const wrapper = {
    get value () {
      return obj[key]
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', { value: true })
  return wrapper
}

// 版本3 - 目前的toRef没有定义set，即是只读的
function toRefV3 (obj, key) {
  const wrapper = {
    get value () {
      return obj[key]
    },
    set value (val) {
      obj[key] = val
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', { value: true })
  return wrapper
}
