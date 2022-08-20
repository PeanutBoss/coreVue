/* KeepAlive - 卸载操作 */

function unmount (vNode) {
  if (vNode.type === Fragment) {
  } else if (typeof type === 'object') {
    // shouldKeepAlive 是一个布尔值，用来标识该组件是否应该被KeepAlive
    if (vNode.shouldKeepAlive) {
      // 对于需要被KeepAlive的组件，我们不应该真的卸载它，而应该调用该组件的父组件
      // 即KeepAlive组件的_deActivate 方法使其失活
      vNode.keepAliveInstance._deActivate()
    } else {
      unmount(vNode.component.subTree)
    }
    return
  }
  const parent = vNode.el.parentNode
  if (parent) {
    parent.removeChild(vNode.el)
  }
}

// 调用patch n1,n2是同一个vNode，只不过是不同时刻的快照
function patch (n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  const { type } = n2
  if (typeof type === 'string') {
  } else if (type === Text) {
  } else if (typeof type === 'object' || typeof type === 'function') {
    if (!n1) {
      // 如果该组件已经被 KeepAlive，则不会重新挂载它，而是会调用 _activate 来激活它
      if (n2.keptAlive) {
        n2.keepAliveInstance._activate(n2, container, anchor)
      } else {
        mountElement(n2, container, anchor)
      }
    } else {
      patchComponent(n1, n2, anchor)
    }
  }
}

/*
* 失活的本质就是将组件所渲染的内容移动到隐藏容器中，而激活的本质是将组件所渲染
*   的内容从隐藏容器中搬运回来的容器
* */

function mountComponent (vNode, container, anchor) {
  // 省略

  const instance = {
    state,
    props: shallowReactive(props),
    slots,
    mounted: [],
    // 只有 KeepAlive 组件的实例下才会有 keepAliveCtx
    keepAliveCtx: null
  }

  // 检查当前要挂载的组件是否是 KeepAlive 组件
  const isKeepAlive = vNode.type.__isKeepAlive
  if (isKeepAlive) {
    // 在 KeepAlive 组件实例上添加keepAliveCtx对象
    instance.keepAliveCtx = {
      // move函数用来移动一段vNode
      move (vNode, container, anchor) {
        // 本质上是将组件渲染的内容移动到隐藏容器中
        insert(vNode.component.subTree.el, container, anchor)
      }
    }
  }
}
