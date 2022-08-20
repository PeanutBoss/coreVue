/* 解耦 transformAST */

// 深度优先遍历AST - 实现对AST中节点地访问 - 将所有 p 标签转换未h1标签
function traverseNode (ast, context) {
  const currentNode = ast

  // context.nodeTransforms是一个数组，其中每一个元素都是一个函数
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    // 将当前节点 currentNode 和 context 都传递给 nodeTransForms 中注册地回调函数
    transforms[i](currentNode, context)
  }

  const children = currentNode.children
  // 如果有子节点，递归调用traverseNode函数进行遍历
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i])
    }
  }
}

function transform (ast) {
  // 在 transform 函数内创建 context 对象
  const context = {
    nodeTransforms: [
      transformElement, // 用来转换标签节点
      transformText // 用来转换文本节点
    ]
  }
}

function transformElement (node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}

function transformText (node) {
  if (node.type === 'Text') {
    node.content = node.content.repeat(2)
  }
}
