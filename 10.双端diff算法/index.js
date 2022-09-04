function insert (el, container, anchor) {
  container.insertBefore(el, anchor)
}

function patchChildren (n1, n2, container) {
  if (typeof n2.children === 'string') {
  } else if (Array.isArray(n2.children)) {
    // 到这里说明子节点都是数组类型
    patchKeyedChildren(n1, n2, container)
  }
}

function patchKeyedChildren (n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children
  // 四个端点指针
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  // 四个端点元素
  let newStartVNode = newChildren[newStartIdx]
  let newEndVNode = newChildren[newEndIdx]
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 开始Diff
    // 如果头部或尾部节点为undefined，说明已经处理过了，直接跳过
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx]
    } else if (oldStartVNode.key === newStartVNode.key) {
      //  第一步 oldStartVNode - newStartVNode

      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 第二步 oldEndVNode - newEndVNode

      // 调用patch打补丁
      patch(oldEndVNode, newEndVNode, container)
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = newChildren[--newEndIdx]
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 第三步 oldStartVNode - newEndVNode

      patch(oldStartVNode, newEndVNode, container)
      insert(oldStartVNode.el, container, newEndVNode.el.nextSibling)
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 第四步 oldEndVNode - newStartVNode

      // 调用patch打补丁
      patch(oldEndVNode, newStartVNode, container)
      // 移动DOM操作    oldEndVNode.el移动 到 oldStartVNode.el 前面
      insert(oldEndVNode.el, container, oldStartVNode.el)
      // 移动DOM操作完成后
      oldEndVNode = oldChildren[--oldEndVNode]
      newStartVNode = newChildren[++newStartVNode]
    } else {
      // 上面四个步骤都没有命中

      // 遍历旧的一组子节点，视图寻找与newStartVNode拥有相同key值的节点
      // idInOld就是新的一组子节点的头部节点在旧的一组子节点中的索引
      const idInOld = oldChildren.findIndex(
        node => node.key === newStartVNode.key
      )
      // idInOld > 0说明找到了可复用的节点，并且需要将其对应的真实DOM移动到头部
      if (idInOld > 0) {
        // 找到匹配到的节点，也就是需要移动的节点
        const vNodeToMove = oldChildren[idInOld]
        // 调用 patch 更新
        patch(vNodeToMove, newStartVNode, container)
        // 将vNodeToMove插入到头部节点oldStartVNode.el之前
        insert(vNodeToMove.el, container, oldStartVNode.el)
        // 由于位置 idInOld 处的节点对应的真实DOM已经发生移动，因此将其设置为 undefined
        oldChildren[idInOld] = undefined
        // 最后更新 newStartVNode 到下一个位置
        newStartVNode = newChildren[++newStartVNode]
      } else {
        // 将 newStartVNode作为新节点挂载到头部，使用当前头部节点 oldStartVNode.el 作为锚点
        patch(null, newStartVNode, container, oldStartVNode.el)
      }
      // 更新头部节点
      newStartVNode = newChildren[++newStartIdx]
    }
  }

  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 说明有新节点需要挂载
    for (let i = newStartIdx; i < newEndIdx; i++) {
      const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1].el : null
      patch(null, newChildren[i], container, anchor)
    }
  } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    // 有需要删除的节点
    for (let i = oldStartIdx; i < oldEndIdx; i++) {
      unmount(oldChildren[i])
    }
  }
}

