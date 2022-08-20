/* 组件的生命周期 */

/*
* 在A组件的setup函数中调用onMounted会将该钩子函数注册到A组件上；而在B组件的setup函数中调用onMounted
*   函数会将钩子函数注册到B组件上。
* 为了实现这个功能，需要一个变量 currentInstance，用它来存储当前组件实例
* */

let currentInstance = null
function setCurrentInstance (instance) {
  currentInstance = instance
}

function mountComponentV1 (vNode, container, anchor) {
  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
    slots,
    // 在组件实例中添加 mounted 数组，存储通过onMounted注册的生命周期钩子函数
    mounted: []
  }

  // 省略部分

  const setupContext = { attrs, emit, slots }
  setCurrentInstance(instance)
  const setupResult = setup(shallowReactive(instance.props), setupContext)
  // 在setup函数执行完毕之后，重置当前组件实例
  setCurrentInstance(null)

  // 省略部分代码
}

function onMounted (fn) {
  if (currentInstance) {
    // 将生命周期函数添加到 instance.mounted 数组中
    currentInstance.mounted.push(fn)
  } else {
    console.error('onMounted 函数只能在 setup 中调用')
  }
}

// 合适的实际调用这些注册到instance.mounted数组中的生命周期钩子函数
function mountComponentV2 (vNode, container, anchor) {
  effect(() => {
    const subTree = render.call(renderContext, renderContext)
    if (!instance.isMounted) {
      // 省略部分
      instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
    } else {
      // 省略
    }
    instance.subTree = subTree
  }, { scheduler: queueJob })
}
