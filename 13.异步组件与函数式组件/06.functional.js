/* 函数式组件 */

/*
* 函数式组件本质上就是一个普通函数，该函数的返回值是一个虚拟DOM
* */

// 挂载组件的逻辑与常规组件一幕一样
function patch (n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }

  const { type } = n2

  if (typeof type === 'string') {
  } else if (typeof type === 'object' || typeof type === 'function') {
    if (!n1) {
      mountComponent(n2, container, anchor)
    } else {
      patchComponent(n1, n2, anchor)
    }
  }
}

function mountComponent (vNode, container, anchor) {
  const isFunctional = typeof vNode.type === 'function'

  let componentOptions = vNode.type

  if (isFunctional) {
    componentOptions = {
      render: vNode.type, // 函数本身
      props: vNode.type.props // 添加的静态属性
    }
  }
}
