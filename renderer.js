function mountElement (vNode, container) {
  // 使用vNode.tag作为标签名称创建DOM元素
  const el = document.createElement(vNode.tag)
  // 通过vNode.props将属性、事件添加到DOM元素上
  for (const key in vNode.props) {
    el.addEventListener(
      key.substr(2).toLowerCase(), // 事件名 onClick => click
      vNode.props[key] // 事件处理函数
    )
  }
  if (typeof vNode.children === 'string') {
    el.appendChild(document.createTextNode(vNode.children))
  } else if (Array.isArray(vNode.children)) {
    vNode.children.forEach(child => mountElement(child, el))
  }
  container.appendChild(el)
}

function renderer (vNode, container) {
  if (typeof vNode.tag === 'string') {
    mountElement(vNode, container)
  } else if (typeof vNode.tag === 'function') {
    mountElement(vNode, container)
  } else if (typeof vNode.tag === 'object') {
    mountComponent(vNode, container)
  }
}

// const MyComponent = function () {
//   return {
//     tag: 'div',
//     props: {
//       onClick: handleCLick
//     },
//     children: 'click me'
//   }
// }

const MyComponent = {
  render () {
    return {
      tag: 'div',
      props: { onClick: handleClick },
      children: 'click me'
    }
  }
}
