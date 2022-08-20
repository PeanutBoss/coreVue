/* 组件状态与更新 */

const MyComponent = {
  name: 'MyComponent',
  data () {
    return {
      foo: 'hello world'
    }
  },
  render () {
    return {
      type: 'div',
      // 通过this访问data中的数据
      children: `foo 的值是：${this.foo}`
    }
  }
}

/* 挂载组件 - base */
function mountComponentV1 (vNode, container, anchor) {
  const componentOptions = vNode.type
  const { render, data } = componentOptions

  // 调用data函数得到原始数据，并调用reactive将其包装为响应式数据
  const state = reactive(data())
  // 调用render函数时将其this设置为state
  // 从而render函数内部可以通过 this 访问组件自身状态数据
  const subTree = render.call(state, state)
  patch(null, subTree, container, anchor)
}

/*
* 需要有能力触发组件的自更新，为此，需要将渲染任务包装到 effect 中
* */
function mountComponentV2 (vNode, container, anchor) {
  const componentOptions = vNode.type
  const { render, data } = componentOptions
  const state = reactive(data())

  // 将组件render函数调用包装到effect中
  effect(() => {
    const subTree = render.call(state, state)
    patch(null, subTree, container, anchor)
  })
}

/*
* 当副作用函数需要重新执行时，不会立即执行它，而是将它缓冲到一个微任务队列中，等到执行栈
*   清空后，再将它从微任务队列中取出并执行。
* */
const queue = new Set()
let isFlushing = false
const p = Promise.resolve()

function queueJob (job) {
  queue.add(job)
  if (!isFlushing) {
    isFlushing = true
    p.then(() => {
      try {
        queue.forEach(job => job())
      } finally {
        isFlushing = false
        queue.clear = 0
      }
    })
  }
}

// 响应式数据发生改变时，副作用函数不不会立即同步执行，而是会被queueJob函数调度，最后在一个微任务中执行
function mountComponentV3 (vNode, container, anchor) {
  const componentOptions = vNode.type
  const { render, data } = componentOptions

  const state = reactive(data())

  effect(() => {
    const subTree = render.call(state, state)
    patch(null, subTree, container, anchor)
  }, {
    // 指定该副作用函数的调度器为queueJob
    scheduler: queueJob
  })
}

