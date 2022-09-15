function patchChildren (n1, n2, container) {
  if (typeof n2.children === 'string') {
    // ...
  } else if (Array.isArray(n2.children)) {
    easyDiffV2(n1, n2, container)
  } else {
    // ...
  }
}

function easyDiffV1 (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 获取新旧子节点列表的长度
  const oldLen = oldChildren.length
  const newLen = newChildren.length
  // 取得较小的一个（可以理解为两组子节点的公共长度）
  const commonLength = Math.min(oldLen, newLen)
  // 遍历 commonLength 次
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], container)
  }
  // 如果 newLen > oldLen，说明有新子节点需要挂载
  if (newLen > oldLen) {
    for (let i = commonLength; i < newLen; i++) {
      patch(null, newChildren[i], container)
    }
  }
  // 如果 oldLen > newLen，说明有旧节点需要卸载
  if (oldLen > newLen) {
    for (let i = commonLength; i < oldLen; i++) {
      unmount(oldChildren[i])
    }
  }
}

function easyDiffV2 (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 遍历新的children
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren.length; j++) {
      const oldVNode = oldChildren[i]
      // 如果找到可复用的两个节点
      if (newVNode.key === oldVNode.key) {
        // 对可复用的两个节点打补丁
        patch(oldVNode, newVNode, container)
        // 一个新节点处理完后开始下一个新节点
        break
      }
    }
  }
}

function easyBigIndex (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
  }
}

function easyMove (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
  }
}

function easyMount (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]

    // 定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，初始值为false - 没找到
    let find = false
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        // 一旦找到可复用的节点，将变量find设置为true
        find = true
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
    // 这里find如果还是false，说明当前newVNode没有在旧的一组子节点中找到可复用的节点
    // 也就是说当前 newVNode 是新增节点，需要挂载
    if (!find) {
      // 为了将节点挂载到正确位置，需要先获取锚点元素
      // 首先获取当前newVNode的前一个vNode节点
      const prevVNode = newChildren[i - 1]
      let anchor = null
      if (prevVNode) {
        // 如果有前一个vNode节点，则使用它的下一个兄弟节点作为锚点元素
        anchor = prevVNode.el.nextSibling
      } else {
        // 如果没有前一个vNode节点，说明即将挂载的新节点是第一个子节点
        // 这是使用容器元素的firstChild作为锚点
        anchor = container.firstChild
      }
      // 挂载 newVNode
      patch(null, newVNode, anchor)
    }
  }
}

function easyUnmount (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]

    // 定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，初始值为false - 没找到
    let find = false
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        // 一旦找到可复用的节点，将变量find设置为true
        find = true
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
    // 这里find如果还是false，说明当前newVNode没有在旧的一组子节点中找到可复用的节点
    // 也就是说当前 newVNode 是新增节点，需要挂载
    if (!find) {
      // 为了将节点挂载到正确位置，需要先获取锚点元素
      // 首先获取当前newVNode的前一个vNode节点
      const prevVNode = newChildren[i - 1]
      let anchor = null
      if (prevVNode) {
        // 如果有前一个vNode节点，则使用它的下一个兄弟节点作为锚点元素
        anchor = prevVNode.el.nextSibling
      } else {
        // 如果没有前一个vNode节点，说明即将挂载的新节点是第一个子节点
        // 这是使用容器元素的firstChild作为锚点
        anchor = container.firstChild
      }
      // 挂载 newVNode
      patch(null, newVNode, anchor)
    }
  }

  // 更新操作完成后，遍历旧的一组子节点
  for (let i = 0; i < oldChildren.length; i++) {
    const oldVNode = oldChildren[i]
    // 拿旧子节点oldVNode去新的一组子节点中寻找具有相同key值的节点
    const has = newChildren.find(
      vNode => vNode.key === oldVNode.key
    )
    if (has) {
      // 如果没找到具有相同key值的节点，则说明需要删除该节点，调用unmount函数将其卸载
      unmount(oldVNode)
    }
  }
}
