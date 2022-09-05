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
}
