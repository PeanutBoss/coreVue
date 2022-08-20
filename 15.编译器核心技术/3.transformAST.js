/* 转换AST */

// 打印当前AST节点中的信息
function dump (node, indent = 0) {
  // 节点的类型
  const type = node.type
  // Element：使用node.type作为描述
  // Text：使用node.content作为描述
  const desc = node.type === 'Root'
    ? ''
    : node.type === 'Element'
      ? node.tag
      : node.content
  // 打印节点类型和描述信息
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
  // 递归地打印子节点
  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2))
  }
}

// 深度优先遍历AST - 实现对AST中节点地访问
function traverseNode (ast) {
  const currentNode = ast
  const children = currentNode.children

  // 对当前节点进行操作
  if (currentNode.type === 'Element' && currentNode.tag === 'p') {
    // 例如将所有p标签转换为h1标签
    currentNode.tag = 'h1'
  }

  // 如果节点类型为Text
  if (currentNode.type === 'Text') {
    // 重复其内容两次
    currentNode.content = currentNode.content.repeat(2)
  }

  // 如果有子节点，递归调用traverseNode函数进行遍历
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i])
    }
  }
}

function transform (ast) {
  // 调用 traverseNode 完成转换
  traverseNode(ast)
  // 打印AST信息
  dump(ast)
}
