/* 转换上下文与节点操作 */

/*
* 解耦时使用 context(上下文对象) 作为容器，将具体操作从transform中抽离出来
* 上下文对象：其实就是在程序某个范围内的 全局变量
* 将 context 作为AST转换函数过程中的上下文数据，所有AST转换函数都可通过context来共享数据
* */

// 用来构造转换上下文信息
function transformV1 (ast) {
  const context = {
    // 增加currentNode，用来存储当前正在转换的节点
    currentNode: null,
    // 增加childIndex，用来存储当前节点在父节点的children中的位置索引
    childIndex: 0,
    // 增加parent，用来存储当前转换节点的父节点
    parent: null,
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  traverseNode(ast, context)
}

/*
* 递归地调用子节点转换时，设置转换上下文对象中地数据
* */
function traverseNodeV1 (ast, context) {
  // 设置当前转换的节点信息 context.currentNode
  context.currentNode = ast

  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](context.currentNode, context)
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      // 递归地调用 traverseNode 转换子节点之前，将当前节点设置为父节点
      context.parent = context.currentNode
      // 设置位置索引
      context.childIndex = i
      // 递归地调用时，将 context 透传
      traverseNode(children[i], context)
    }
  }
}

function transformV2 (ast) {
  const context = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode (node) {
      // 为了替换节点，需要修改AST; 找到当前节点在父节点地children中地位置：context.childIndex
      // 然后使用新节点替换
      context.parent.children[context.childIndex] = node
      context.currentNode = node
    },
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  traverseNode(ast, context)
}

function transformTextV1 (node, context) {
  if (node.type === 'Text') {
    // 如果当前节点时文本节点，则调用 context.replaceNode 函数将其替换为元素节点
    context.replaceNode({
      type: 'Element',
      tag: 'span'
    })
  }
}

function transformV3 (ast) {
  const context = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode (node) {
      context.parent.children[context.childIndex] = node
      context.currentNode = node
    },
    removeNode () {
      if (context.parent) {
        // 调用数组地 splice 方法，根据当前节点地索引删除当前节点
        context.parent.children.splice(context.childIndex, 1)
        // 将 context.currentNode 置空
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  traverseNode(ast, context)
}

function traverseNodeV2 (ast, context) {
  context.currentNode = ast

  const transform = context.nodeTransforms
  for (let i = 0; i < transform.length; i++) {
    // 由于任何转换函数都有可能移除当前节点，因此每个转换函数执行完毕后，都应该检查
    //  当前节点是否已经被移除，如果移除了，直接返回即可
    transform[i](context.currentNode, context)
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }
}

function transformTextV2 (node, context) {
  if (node.type === 'Text') {
    context.removeNode()
  }
}
