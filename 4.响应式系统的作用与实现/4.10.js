/* 计算属性 - 懒执行 */

function effect (fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    // 将副作用函数添加到栈中
    effectStack.push(effectFn)
    const res = fn()
    // 副作用函数执行完后从栈中弹出
    effectStack.pop()
    // 解决effect嵌套时，activeEffect不能恢复的问题
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  // 实现副作用函数不立即执行的功能
  if (!options.lazy) {
    effectFn()
  }
  // 将副作用函数作为返回值返回
  return effectFn
}
/*
* 传递给effect的函数的参数fn才是真正执行的副作用函数，而effectFn时包装后的副作用函数。为了通过effectFn得到正真
*   的副作用函数fn的执行结果，需要将其保存到变量res中，然后将其作为effectFn的返回值。
* */

function computed (getter) {
  const effectFn = effect(getter, {
    lazy: true
  })
  const obj = {
    get value () {
      return effectFn()
    }
  }
  return obj
}
/*
* computed函数接收一个getter还敢书作为参数，将getter函数作为副作用函数，用它出啊关键一个懒执行的effect。
*   computed函数的执行会返回一个对象，该对象的value属性时一个访问器属性，只有当读取value的值时，才会执行effectFn
*   并将结果作为返回值返回。
* 但是现在只有懒计算，不能做到对值进行缓存。
* */
