/* 响应式数据最基本实现 */

/*
* 响应式系统的基本实现
*   拦截读取和设置操作
* */

/*
* effect执行时，触发obj.text的读取操作
* 修改obj.text时，会触发obj.text的设置操作
* 当读取obj.text时，将副作用函数effect存储到一个容器中
* */
/*
const obj = { text: 'hello world' }
function effect () {
  document.body.innerText = obj.text
}
*/

// 存储副作用的容器
const bucket = new Set()
// 原始数据
const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get(target, key) {
    // 将副作用函数添加到容器中
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  set(target, key, value) {
    // 设置属性值
    target[key] = value
    // 把副作用函数从容器中取出并只执行
    bucket.forEach(fn => fn())
    // 返回 true 代表设置操作成功
    return true
  }
})

// 副作用函数
function effect () {
  document.body.innerText = obj.text
}

// 执行副作用函数
effect()
// 1s后修改响应式数据
setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)

/*
* 不难看出，一个响应式系统工作流程：
* 当读取操作发生时，将副作用函数收集到桶中
* 当设置操作发生时，从桶中取出副作用函数并执行
* */

/*
* 目前的实现还存在一些缺陷，例如直接通过名字（effect）来获取副作用函数，这种硬编码方式不灵活。
* 副作用函数的名字可以任意取，甚至使用一个匿名函数，因此需要想办法去掉这种硬编码的机制。
* */
