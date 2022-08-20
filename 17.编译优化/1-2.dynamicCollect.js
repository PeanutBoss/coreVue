/* 动态节点收集 */

// createVNode 是用来创建虚拟DOM节点的辅助函数
function createVNodeV1 (tag, props, children) {
  const key = props && props.key
  props && delete props.key
  return {
    tag,
    props,
    children,
    key
  }
}

/*
* 创建Block，应该从内部向外收集
* 当外层 createVNode 函数执行时，内层的 createVNode 函数已经执行完毕了。因此为了让外层 Block 节点能够收集
*   到内层动态节点，就需要一个栈结构数据来临时存储内层的动态节点。
* */

// 动态节点栈
const dynamicChildrenStack = []
// 当前动态节点集合
let currentDynamicChildren = null
// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock () {
  dynamicChildrenStack.push(currentDynamicChildren = [])
}
// closeBlock 用来将通过 openBlock 创建的动态节点集合从栈中弹出
function closeBlock () {
  currentDynamicChildren = dynamicChildrenStack.pop()
}

function createVNodeV2 (tag, props, children, flags) {
  const key = props && props.key
  props && delete props.key
  const vNode = {
    tag,
    props,
    children,
    key
  }

  if (typeof flags !== 'undefined' && currentDynamicChildren) {
    // 将动态节点添加到当前动态节点集合中
    currentDynamicChildren.push(vNode)
  }

  return vNode
}

function render () {
  // 使用 createBlock 代替 createVNode 来创建block
  return (openBlock(), createBlock('div', null, [
    createVNode('p', { class: 'foo' }, null, 1),
    createVNode('p', { class: 'bar' }, null)
  ]))
}

function createBlock (tag, props, children) {
  // block本质上也是一个vNode
  const block = createVNode(tag, props, children)
  // 将当前动态节点集合作为 block.dynamicChildren
  block.dynamicChildren = currentDynamicChildren
  // 关闭block
  closeBlock()
  return block
}

// currentDynamicChildren 数组中所存储的就是属于当前 Block 的所有动态子代节点


