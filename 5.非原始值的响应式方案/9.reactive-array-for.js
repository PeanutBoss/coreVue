/* 拦截对 for-in、for-of的代理 */

/*
* for...in
* 无论是为数组添加新元素还是直接修改数组的长度，本质上都是修改了数组的length数组。
*   一旦 length 属性被修改，那么for-in循环对数组的遍历结果就会改变。
* */

function createReactiveIn (obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    ownKeys(target) {
      // 如果操作目标是数组，则使用length属性作为key并建立响应联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })
}

/*
* for...of
* 无论是for-of循环还是调用values等方法，都会读取数组的Symbol.iterator属性。改属性是一个symbol值，
*   为了避免发生意外错误，不应该在symbol上建立响应式联系。
* */
function createReactiveOf (obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log('get', key)
      if (key === 'raw') {
        return target
      }
      // 如果key的类型是symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }

      const res = Reflect.get(target, key, receiver)
      if (!isShallow) return res
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    }
  })
}
