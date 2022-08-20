/* 客户端激活 */

// EXAMPLE
const html = renderComponentVNode(compVNode)

// 假设客户端拿到了由服务器渲染的字符串，获取挂载点
const container = document.querySelector('#app')
container.innerHTML = html
// 调用 hydrate 函数记过
renderer.hydrate(compVNode, container)

function hydrate (vNode, container) {
  hydrateVnode(container.firstChild, vNode)
}

function hydrateNode (node, vNode) {
  const { type } = vNode
  vNode.el = vNode

  if (typeof type === 'object') {
    // 如果是组件，则调用 mountComponent 激活
    mountComponent(vNode, container, null)
  } else if (typeof type === 'string') {
    // 检查真实DOM的类型与虚拟DOM的类型是否匹配
    if (node.nodeType !== 1) {
      console.error('服务端渲染的真实DOM节点是：', node)
    } else {
      hydrateElement(node, vNode)
    }
  }
  // 返回当前节点的下一个兄弟节点，以边继续进行后续激活操作
  return node.nextSibling()
}

function hydrateElement (el, vNode) {
  if (vNode.props) {
    for (const key in vNode.props) {
      // 只有事件类型地 props 需要处理
      if (/^on/.test(key)) {
        patchProps(el, key, null, vNode.props[key])
      }
    }
  }

  // 递归地激活子节点
  if (Array.isArray(vNode.children)) {
    // 从第一个子节点开始
    let nextNode = el.firstChild
    const len = vNode.children.length
    for (let i = 0; i < len; i++) {
      // 激活子节点，没记过一个，hydrateNode都会返回当前子节点地下一个兄弟节点
      // 就可以进行后续地记过
      nextNode = hydrateNode(nextNode, vNode.children[i])
    }
  }
}

function mountComponent (vNode, container, anchor) {
  // 省略
  instance.update = effect(() => {
    const subTree = render.call(renderContext, renderContext)
    if (!instance.isMounted) {
      beforeMount && beforeMount.call(renderContext)
      if (vNode.el) {
        // 如果 vNode.el 存在，意味着需要激活
        hydrateNode(vNode.el, subTree)
      } else {
        patch(null, subTree, container, anchor)
      }
      instance.isMounted = true
      mounted && mounted.call(renderContext)
      instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
    } else{
      beforeMount && beforeMount.call(renderContext)
      patch(instance.subTree, subTree, container, anchor)
      update && update.call(renderContext)
    }
    instance.subTree = subTree
  }, { scheduler: queueJob })
}
