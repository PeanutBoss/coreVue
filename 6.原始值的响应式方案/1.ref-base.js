/* 对基本数据类型的代理 */

/*
* proxy代理的目标必须是原始值，所以没有任何手段拦截对原始值的操作。
*   但可以使用非原始值包裹原始值。
*   例如：{ value: 'vue' }
* 但这样会导致两个问题：
*   1.为了创建一个响应式原始值，不得不创建一个包裹对象
*   2.包裹对象由用户自定义意味着不规范，可以随意命名，例如 obj.value / obj.val
* */

// 版本1 - 解决上面两个问题
function refV1 (val) {
  // 在 ref 函数内部创建包裹对象
  const wrapper = { value: val }
  // 将包裹对象编程响应式数据
  return reactive(wrapper)
}

const refVal1 = refV1(1)
const refVal2 = reactive({ value: 2 })
/*
* 上面这段代码如何区分ref呢？
* 从实现来看它们没有任何区别，但是有必要区分ref，涉及到后面的脱ref
* */
// 版本2 - 区分ref
function ref (val) {
  const wrapper = { value: val }
  // 在wrapper上定义一个不可枚举且不可写的属性 __v_ifRef，值为true
  Object.defineProperty(wrapper, '__v_isRef', { value: true })
  return reactive(wrapper)
}
