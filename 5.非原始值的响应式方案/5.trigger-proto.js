/* 响应式数据与它的原型对象之间的联系 */

/*
* 读取 child.bar 属性，child代理的obj本身并没有bar属性，因此会获取对象obj的原型，也就是parent。
*   所以最终得到的实际上是parent.bar的值。parent本身也是响应式数据，因此在副作用函数中访问parent.bar时，
*   导致副作用函数被收集，所以child.bar 和 parent.bar 都与副作用函数建立了联系。
* */
const obj = {}
const proto = { bar: 1 }
const child = reactive(obj)
const parent = reactive(proto)
Object.setPrototypeOf(child, parent)

effect(() => {
  console.log(child.bar)
})
// 修改child.bar的值，会导致副作用函数重新执行两次
child.bar = 2
/*
* [[set]]方法的内部执行流程：设置属性不存在于对象上，那么会取得其原型，并调用原型的[[set]]方法，也就是parent的[[set]]方法。
*   也就是说虽然操作的是child，但是parent的set方法也会被执行，因此副作用函数被触发了两次。
*
* 访问child[key]触发依赖时：
*   target是原始对象obj，receiver是代理对象child，receiver实际就是target的代理对象
* 当parent代理对象的set拦截函数执行时：
*   target时proto，receiver仍然时代理对象child
* 通过以上分以可以确定哪一次时原型引起的更新，并将其屏蔽掉。
* */

function oldReactive (obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      track(target, key)
      return Reflect.get(target, key, receiver)
    }
    // ...
  })
}

// 使代理对象可以通过raw属性访问原始数据
child.raw = obj
parent.raw = proto

function reactive (obj) {
  return new Proxy(obj, {
    set(target, key, value, receiver) {
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty(target, key) ? 'set' : 'Add'
      const res = Reflect.set(target, key, newVal, receiver)
      // 只有当receiver使target的代理对象时才触发依赖
      if (target === receiver.raw) {
        // 比较新旧值，只有不全等且部位NaN的时候猜触发响应
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type)
        }
      }
      return res
    }
  })
}
