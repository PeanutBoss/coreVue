/* 更新支持 */

/*
* 优先检测虚拟DOM是否存在动态节点集合
* 如果存在，直接调用 patchBlockChildren 函数完成更新
* */
function patchElement (n1, n2) {
  const el = n2.el = n1.el
  const oldProps = n1.props
  const newProps = n2.props

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

  if (n2.dynamicChildren) {
    // 调用 patchBlockChildren 函数，只会更新动态节点
    patchBlockChildren(n1, n2)
  } else {
    patchChildren(n1, n2, el)
  }

  // 在处理children时，调用 patchChildren 函数
  patchChildren(n1, n2, el)
}

function patchBlockChildren (n1, n2) {
  for (let i = 0; i < n2.dynamicChildren.length; i++) {
    // patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i])
    patchElement(n1.dynamicChildren, n2.dynamicChildren)
  }
}
