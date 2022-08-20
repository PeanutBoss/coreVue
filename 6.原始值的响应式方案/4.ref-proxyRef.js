/* ref的代理 - 模板中直接使用ref */

/*
* 脱ref
* 如果访问的是ref，直接将该ref对应的value属性值返回
* */

function proxyRefs (target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 如果读取的值是ref，则返回它的value属性值
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      const value = target[key]
      if (value.__v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}

// vue组件中setup返回的数据会传递给proxyRefs进行处理
const newObj = proxyRefs({ ...toRefs(obj) })
