function patchKeyedChildren (n1, n2, container) {
  const newChildren = n1.children
  const oldChildren = n2.children
  // 处理相同的前置节点
  // 索引 j 指向新旧两组子节点的开头
  let j = 0
  let oldVNode = oldChildren[j]
  let newVNode = newChildren[j]
  // while 循环向后遍历，直到遇到不同 key 值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用 patch 函数进行更新
    patch(oldVNode, newVNode, container)
    // 让索引 j 递增以对下一个节点进行处理
    j++
    oldVNode = oldChildren[j]
    newVNode = newChildren[j]
  }

  // 获取最后的子节点的索引值
  let oldEnd = oldChildren.length - 1
  let newEnd = newChildren.length - 1
  // 获取最后的子节点
  oldVNode = oldChildren[oldEnd]
  newVNode = newChildren[newEnd]
  // while 循环从后向前遍历，直至遇到不同 key 值得节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用 patch 函数进行更新
    patch(oldVNode, newVNode, container)
    // 让索引 j 递减以对下一个节点进行处理（因为是从后往前所以递减）
    oldEnd--
    newEnd--
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]
  }

  // 预处理完毕后，如果满足 j --> newEnd 之间的节点应该作为新节点插入
  if (j > oldEnd && j <= newEnd) {
    // 锚点的索引
    const anchorIndex = newEnd + 1
    // 得到锚点元素
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
    // 将新增的节点逐个挂载
    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor)
    }
  } else if (j > newEnd && j<= oldEnd) {
    // 有要删除的节点
    while (j <= oldEnd) {
      unmount(oldChildren[j++])
    }
  }
}
