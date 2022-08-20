/* 转换流程 - 进入与退出 */

/*
* 在转换AST节点地过程中，往往需要根据子节点地情况来决定如何对当前节点进行转换。这就要求父节点地转换操作必须
*   等待它所有子节点全部转换完毕后再执行。
* 因此对节点地访问分为两个阶段，即 进入阶段 和 退出阶段。
*   当转换函数处于进入阶段时，先进入父节点，再进入父节点。而当转换函数处于退出节点时，则会先退出子节点，在退出父节点。
* */

function traverseNode (ast, context) {
  context.currentNode = ast

  // 增加退出节点的回调函数列表
  const exitFns = []
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    // 转换函数可以返回另一个函数，该函数即作为退出阶段地回调函数
    const onExit = transforms[i](context.currentNode, context)
    if (onExit) {
      // 将退出阶段的回调函数添加到 exitFns 中
      exitFns.push(onExit)
    }
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

  // 在节点处理的最后阶段执行缓存到 exitFns 中的回调函数
  // 这里需要反序执行
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

/*
* 编写转换函数时，可以将转换逻辑编写在退出阶段的回调函数中，从而保证在对当前访问的节点进行
*   转换之前，其子节点一定全部处理完毕了
* 退出阶段的回调函数是反序执行的：因为exit中的回调，子节点处理完之后才处理父节点
* */
