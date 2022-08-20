/* Teleport */

/*
* 要解决的问题：
* */

function patch (n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }

  const { type } = n2

  if (typeof type === 'string') {
  } else if (typeof type === 'object' && type.__isTeleport) {
    // 组件选项中如果存在 __isTeleport 标识，则它时 Teleport 组件
    // 调用Teleport组件选项中的process函数将控制权交接出去
    // 传递给process函数的第五个参数时渲染器的一些内部方法
    type.process(n1, n2, container, anchor, {
      patch,
      patchChildren,
      unmount,
      move (vNode, container, anchor) {
        insert(vNode.component
          ? vNode.component.subTree.el // 移动一个组件
          : vNode.el, // 移动普通元素
          container,
          anchor
        )
      }
    })
  } else if (typeof type === 'object' || typeof type === 'function') {}
}

/*
* 调用组件选项中定义的process函数将渲染控制权完全交接出去，就是了渲染逻辑的分离
* */

function render () {
  return {
    type: Teleport,
    // 以普通children的形式代表被Teleport的内容
    children: [
      { type: 'h1', children: 'Title' },
      { type: 'p', children: 'content' }
    ]
  }
}

const Teleport = {
  __isTeleport: true,
  process (n1, n2, container, anchor, internals) {
    // 通过internals参数取得渲染器的内部方法
    const { patch, patchChildren, move } = internals
    // 如果旧vNode - n1不存在，则是全新的挂载，否则执行更新
    if (!n1) {
      // 挂载
      // 获取容器，即挂载点
      const target = typeof n2.props.to === 'string'
        ? document.querySelector(n2.props.to)
        : n2.props.to
      // 将children渲染到指定挂载点即可
      n2.children.forEach(c => patch(null, c, target, anchor))
    } else {
      // 更新
      patchChildren(n1, n2, container)
      // 更新操作可能由于Teleport组件的to属性变化引起的
      if (n2.props.to !== n1.props.to) {
        // 获取新的容器
        const newTarget = typeof n2.props.to === 'string'
          ? document.querySelector(n2.props.to)
          : n2.props.to
        // 移动到新的容器
        n2.children.forEach(c => move(c, newTarget))
      }
    }
  }
}
