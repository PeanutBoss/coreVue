/* 区分vNode类型 */

function patchOld (vNode1, vNode2, container) {
  if (!vNode1) {
    mountElement(vNode2, container)
  } else {
    // vNode1存在，意味着打补丁
  }
}

/*
* 如果旧vNode存在，需要在新旧vNode之间打补丁。但需要保证新旧vNode所描述的内容相同（比如一个是p标签，一个是input标签）。
*   若描述的内容不同，则 vNode.type 属性的值不同，这种情况下需要先卸载旧的元素，再将新元素重新挂载。
* */
function patchV1 (vNode1, vNode2, container) {
  // 如果 旧vNode 存在，则对比新旧vNode的类型
  if (vNode1 && vNode.type !== vNode2.type) {
    // 如果新旧vNode类型不同，则直接将旧vNode卸载
    unmount(vNode1)
    vNode1 = null
  }
  if (!vNode1) {
    mountElement(vNode2, container)
  } else {
    // 更新，即需要打补丁
  }
}

/*
* 前面一直假设vNode是普通的标签元素，但严谨的做法是根据 vNode.type 进一步确认它们的类型，从而使用
*   正确的函数进行处理。
* */
function patchV2 (vNode1, vNode2, container) {
  // 如果 旧vNode 存在，则对比新旧vNode的类型
  if (vNode1 && vNode.type !== vNode2.type) {
    // 如果新旧vNode类型不同，则直接将旧vNode卸载
    unmount(vNode1)
    vNode1 = null
  }

  const { type } = vNode2
  // 普通标签元素
  if (typeof type === 'string') {
    if (!vNode1) {
      mountElement(vNode2, container)
    } else {
      // 更新，即需要打补丁
    }
  } else if (typeof type === 'object') {
    // 如果vNode2.type是对象，那么它描述的是组件
  } else if (typeof type === 'xxx') {
    // 处理其他类型
  }
}
