/* 组件事件与emit的实现 */

/*
* 使用组件的时候已经给组件传递了对应事件的处理函数，所以在子组件向父组件分发事件时，
*   只需要执行对应的onEventName函数即可
* */

function mountComponent (vNode, container, anchor) {
  // 省略

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null
  }

  // 定义emit函数
  function emit (event, ...payload) {
    // 根据约定对事件名进行处理，例如 change -> onChange
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    // 根据处理后的事件名称取props中寻找对应事件处理函数
    const handler = instance.props[eventName]
    if (handler) {
      // 调用事件处理函数
      handler(...payload)
    } else {
      console.error('事件不存在')
    }
  }

  // 将emit函数添加到setupContext中
  const setupContext = { attrs, emit }

  // 省略
}

function resolveProps (options, propsData) {
  const props = {}
  const attrs = {}
  for (const key in propsData) {
    // 以on开头的props，无论是否显示生命，都添加到props中
    if (key in options || key.startsWith('on')) {
      props[key] = propsData[key]
    } else {
      attrs[key] = propsData[key]
    }
  }
  return [props, attrs]
}
