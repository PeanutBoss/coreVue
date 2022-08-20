/* 组件实例与组件声明周期 */

/*
* 组件本质上就是一个状态集合（或一个对象），它维护着组件运行过程中的所有信息。
* */
function mountComponent (vNode, container, anchor) {
  const componentOptions = vNode.type
  const { render, data } = componentOptions
  const state = reactive(data())

  // 定义组件实例，一个组件实例本质上就是一个对象，包含与组件有关的状态信息
  const instance = {
    // 组件自身的状态数据
    state,
    // 一个布尔值，用来表示组件是否已经被挂载，初始值为false
    isMounted: false,
    // 组件所渲染的内容，即字数（subTree）
    subTree: null
  }

  // 将组件实例设置到vNode上，用于后续更新
  vNode.component = instance

  effect(() => {
    // 调用组件渲染函数，获得子树
    const subTree = render.call(state, state)
    // 检查组件是否已经被挂载
    if (!instance.isMounted) {
      // 初次挂载，调用patch函数第一个参数传递null
      patch(null, subTree, container, anchor)
      // 将组件实例的isMounted设置为true，这样当更新发生时不会再次进行挂载操作
      instance.isMounted = true
    } else {
      // isMounted 为true时，说明组件已经被挂载，只需要完成自更新
      // 所以在调用patch函数时，第一个参数为组件上一次渲染的字数
      // 即使用新的子树和上一次渲染的子树进行打补丁操作
      patch(instance.subTree, subTree, container, anchor)
    }
    instance.subTree = subTree
  }, { scheduler: queueJob })
}

/*
* 加入生命周期
*   合适的时候调用对应的生命周期钩子
* */
function mountComponentAlive (vNode, container, anchor) {
  const componentOptions = vNode.type
  const {
    render, data, beforeCreate, created, beforeMount, mounted,
    beforeUpdate, updated
  } = componentOptions

  beforeCreate && beforeCreate()
  const state = reactive(data())
  const instance = {
    state,
    isMounted: false,
    subTree: null
  }
  vNode.component = instance

  created && created()
  effect(() => {
    const subTree = render.call(state, state)
    if (!instance.isMounted) {

      beforeMount && beforeMount()
      patch(null, subTree, container, anchor)
      instance.isMounted = true

      mounted && mounted()
    } else {

      beforeUpdate && beforeUpdate()
      patch(instance.subTree, subTree, container, anchor)

      updated && updated()
    }
    instance.subTree = subTree
  }, { scheduler: queueJob })
}
