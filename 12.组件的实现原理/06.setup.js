/* setup函数的作用与实现 */

/*
* 在组件的生命周期中。setup函数只会在挂载时执行一次，它的返回值可以有两种情况
*   返回一个函数：该函数将会作为组件的render函数
*   返回一个对象：该对象包含的数据将暴露给模板使用
* 且setup函数接收两个参数，第一个参数时props数据对象，第二个参数也是一个对象，通常
*   称为setupContext
* */

function mountComponent (vNode, container, anchor) {
  const componentOptions = vNode.type
  // 从组件选项中取出 setup 函数
  let { render, data, setup, props: propsOptions } = componentOptions

  beforeCreated && beforeCreated()

  const state = data ? reactive(data()) : null
  const [props, attrs] = resolveProps(propsOptions, vNode.props)

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null
  }

  // 由于还没有实现emit和slots，所以暂时只需要attrs
  const setupContext = { attrs }
  // 调用setup函数，将props作为第一个参数传递， setupContext作为第二个参数传递
  const setupResult = setup(shallowReadonly(instance.props), setupContext)
  let setupState = null
  // 如果setup函数的返回值是函数，则将其作为渲染函数
  if (typeof setupResult === 'function') {
    if (render) console.error('setup函数返回渲染函数，render选项将被忽略')
    // 将 setupResult 作为渲染函数
    render = setupResult
  } else {
    setupState = setupResult
  }

  vNode.component = instance

  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props } = t
      if (state && k in state) {
        return state[k]
      } else if (k in props) {
        return props[k]
      } else {
        console.log('不存在')
      }
    },
    set(t, k, v, r) {
      const { state, props } = t
      if (state && k in state) {
        state[k] = v
      } else if (k in props) {
        console.warn(`props are readonly`)
      } else {
        console.log('不存在')
      }
    }
  })

  created && created.call(renderContext)
}
