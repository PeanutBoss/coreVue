/* 设计一个完善的响应系统 - 注册副作用函数的机制 */

const onePiece = { name: '路飞' }

// 收集依赖的容器
const bucket = new Set()

// 用一个全局变量存储被注册的副作用函数
let activeEffect

// effect函数用于注册副作用函数
function effect (fn) {
  // 调用effect注册副作用函数时，将副作用函数fn赋值给activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}

const pirate = new Proxy(onePiece, {
  get (target, key) {
    // 将activeEffect中存储的副作用函数收集到容器中
    if (activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },
  set (target, key, value) {
    target[key] = value
    bucket.forEach(fn => fn())
    return true
  }
})

effect(() => {
  console.log('effect run') // 输出两次
  document.body.innerText = pirate.name
})

setTimeout(() => {
  pirate.notExist = 'hello vue3'
}, 1000)

/*
* 上面代码的工作流程：
* 首先调用effect()，effect执行的时候会做 pirate 的读取操作（pirate.name），将传入effect的匿名函数赋值给activeEffect，
*   然后调用匿名函数（输出effect run），这时会触发响应式对象pirate的get操作，将activeEffect收集到依赖集合中。
* 一秒后再次调用effect，传入一个匿名函数，匿名函数将为响应式对象pirate添加了一个属性 notExist，触发响应式对象的set操作，
*   set操作中会将依赖集合中收集的依赖拿出来执行，于是再次输出effect run。
* */

/*
* 硬编码问题解决后，还暴露出一个问题：
* 添加的时notExist属性，字段 pirate.notExist 并没有与副作用建立响应练习，因此定时器内的语句的执行不应该触发
*   匿名副作用函数重新执行。问题的原因在于 副作用函数与被操作的目标字段之间没有建里明确的联系。
* */
