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
  } else {
    // j 指向的是未处理的新节点的开头
    // newEnd 指向的是未处理的新节点的末尾
    // 所以 newEnd - j + 1就是剩余未处理的新节点
    const count = newEnd - j + 1
    // 构造一个与未处理的新节点数量相等长度的数组，并用 -1 填充
    const source = new Array(count)
    source.fill(-1)

    // oldStart newStart 都指向未处理的新节点列表的起始索引
    const oldStart = j
    const newStart = j
    // 遍历旧的一组子节点
    for (let i = oldStart; i <= oldEnd; i++) {
      // 获取本次循环用来对比的旧节点
      const oldVNode = oldChildren[i]
      // 遍历新的一组子节点
      for (let k = newStart; k <= newEnd; k++) {
        // 获取本次循环用来对比的新节点
        const newVNode = newChildren[i]
        // 找到具有相同 key 值得可复用节点
        if (oldVNode.key === newVNode.key) {
          // 调用patch进行更新
          patch(oldVNode, newVNode, container)
          // 最后填充 source 数组
          source[k - newStart] = i
        }
      }
    }
  }
}

function patchKeyedChildrenV1 (n1, n2, container) {
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
  } else {
    // j 指向的是未处理的新节点的开头
    // newEnd 指向的是未处理的新节点的末尾
    // 所以 newEnd - j + 1就是剩余未处理的新节点
    const count = newEnd - j + 1
    // 构造一个与未处理的新节点数量相等长度的数组，并用 -1 填充
    const source = new Array(count)
    source.fill(-1)

    // oldStart newStart 都指向未处理的新节点列表的起始索引
    const oldStart = j
    const newStart = j

    // 新增两个变量
    let moved = false // 是否需要移动
    let pos = 0 // 遍历一组子节点的过程中遇到的最大索引值

    // 构造索引表
    const keyIndex = {}
    // 循环新节点列表经预处理后剩余的节点
    for (let i = newStart; i <= newEnd; i++) {
      // newChildren[i].key 指的是当前循环的的节点的key属性
      keyIndex[newChildren[i].key] = i
    }

    // 新增变量 patched，待变更新过的节点数量
    let patched = 0
    // 循环旧的一组节点中剩余未处理的节点
    for (let i = oldStart; i <= oldEnd; i++) {
      // 取到当前的旧节点
      oldVNode = oldChildren[i]
      // 如果更新过的节点数量小于等于需要更新的节点数量。则执行更新
      if (patched <= count) {
        // 通过索引表快速找到新的一组子节点中具有 相同key值 的节点位置
        const k = keyIndex[oldVNode.key]
        if (typeof k !== 'undefined') {
          newVNode = newChildren[k]
          // 调用 patch 完成更新
          patch(oldVNode, newVNode, container)
          // 更新一个节点之后就让它递增
          patched++
          // 填充source数组
          source[k - newStart] = i
          // 判断节点是否需要移动
          if (k < pos) {
            // pos 代表遍历就得子节点得过程中遇到得最大索引值
            moved = true
          } else {
            // 如果出现大于当前pos的值，则更新pos
            pos = k
          }
        } else {
          // 如果没有找到对应索引，说明新节点列表没有该节点，需要卸载
          unmount(oldVNode)
        }
      } else {
        // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的节点
        unmount(oldVNode)
      }
    }

    if (moved) {
      // 求得最长递增子序列
      const seq = lis(source)

      // s 指向最长递增子序列的最后一个元素
      let s = seq.length - 1
      // i 指向新的一组节点的最后一个元素
      let i = count - 1
      // for 循环使 i 递减
      for (i; i >= 0; i--) {
        if (source[i] === -1) { // 说明索引为 i 的节点使新的节点，应该将其挂载
          // i + newStart 获取该节点在整个 newChildren 中的索引
          const pos = i + newStart
          const newVNode = newChildren[pos]
          // 以下一个元素作为锚点，取得它的索引
          const nextPos = pos + 1
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
          // 挂载操作
          patch(null, newVNode, container, anchor)
        } else if (i !== seq[s]) { // 说明该节点需要移动
          // 获取该节点在 newChildren 中的索引
          const pos = i + newStart
          const newVNode = newChildren[pos]
          // 获取锚点元素的索引
          const nextPos = pos + 1
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
          // 插入当前节点
          insert(newVNode.el, container, anchor)
        } else {
          // 当 i === seq[s] 时，说明该位置节点不需要移动
          // 只需要让 s 指向下一个位置
          s--
        }
      }
    }
  }
}

// 求最长递增子序列
function lis (source) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
