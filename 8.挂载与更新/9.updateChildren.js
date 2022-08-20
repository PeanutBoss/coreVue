/* 更新子节点 */

/*
* 挂载子节点，首先要区分其类型
*   如果 children 是字符串，说明具有文本子节点
*   如果 children 是数组，说明元素具有多个子节点
* */
function mountElement(vNode, container) {
  const el = vNode.el = createElement(vNode.type)
  if (typeof vNode.children === 'string') {
    setElementText(el, vNode.children)
  } else if (Array.isArray(vNode.children)) {
    vNode.children.forEach(child => {
      patch(null, child, el)
    })
  }
  if (vNode.props) {
    for (const key in vNode.props) {
      patchProps(el, key, null, vNode.props[key])
    }
  }
  insert(el, container)
}

/*
* 那么更新时，子节点共三种情况
*   没有子节点
*   具有文本节点
*   其它情况（无论时单个子元素还是多个子节点，都可以用数组来标识）
* */
function patchElement (oldN, newN) {
  const el = newN.el = oldN.el
  const oldProps = oldN.props
  const newProps = newN.props
  // 更新prop
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key])
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProps(el, key, oldProps[key], null)
    }
  }
  // 更新子节点是对一个元素进行打补丁的最后一步操作
  patchChildren(oldN, newN, el)
}

function patchChildrenV1 (oldN, newN, container) {
  if (typeof newN.children === 'string') {
    // 旧子节点情况：没有子节点、文本节点、一组子节点
    // 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况什么都不做
    if (Array.isArray(oldN.children)) {
      oldN.children.forEach(c => unmount(c))
    }
    // 最后将新的文本节点内容设置给容器元素
    setElementText(container, newN.children)
  }
}

/*
* 旧子节点 - 如果没有或者时文本子节点的情况，只需要将容器元素清空，然后将新的子节点挂载到容器即可。
* */
function patchChildrenV2 (oldN, newN, container) {
  if (typeof newN.children === 'string') {
    // 省略
  } else if (Array.isArray(newN.children)) {
    // 新子节点是一组子节点
    if (Array.isArray(oldN.children)) {
      // 核心的diff算法
      oldN.children.forEach(c => unmount(c)) // 全部卸载
      newN.children.forEach(c => patch(null, c, container)) // 新子节点全部挂载
    } else {
      // 旧子节点要么不存在，要么是文本节点，无论哪种情况，都只需要清空容器并挂载新元素
      setElementText(container, '')
      newN.children.forEach(c => patch(null, c, container))
    }
  }
}

function patchChildrenV3 (oldN, newN, container) {
  if (typeof newN.children === 'string') {
    // 省略
  } else if (Array.isArray(newN.children)) {
    // 省略
  } else {
    // 说明新子节点不存在
    if (Array.isArray(oldN.children)) {
      // 子节点是一组子节点，逐个卸载
      oldN.children.forEach(c => unmount(c))
    } else {
      // 旧子节点是文本子节点，清空内容即可
      setElementText(container, '')
    }
    // 没有子节点，什么都不用做
  }
}


