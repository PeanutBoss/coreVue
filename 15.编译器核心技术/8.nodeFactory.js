/* JavaScript AST节点的辅助函数 */

// 创建 字符串字面量 节点
function createStringLiteral (value) {
  return {
    type: 'StringLiteral',
    value
  }
}

// 创建 标识符 节点
function createIdentifier (name) {
  return {
    type: 'Identifier',
    name
  }
}

// 创建 数组表达式 节点
function createArrayExpression (elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

// 创建 函数调用表达式 节点
function createCallExpression (callee, arguments) {
  return {
    type: 'CallExpression',
    callee,
    arguments
  }
}

// 转换函数，分别处理文本节点和标签节点
function transformText (node) {
  if (node.type !== 'Text') return
  // 文本节点对应JavaScript AST 节点其实就是一个字符串字面量
  // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
  // 最后将文本节点对应的JavaScript AST 节点添加到 node.jsNode中
  node.jsNode = createStringLiteral(node.content)
}

function transformElement (node) {
  // 将转换代码编写在退出节点的回调函数中，这样可以保证该标签节点的子节点全部处理完毕
  return () => {
    // 如果被转换的节点不是元素节点，则什么都不做
    if (node.type !== 'Element') return

    // 创建 h 函数调用语句
    // h 函数调用的第一个参数是标签名称，因此我们以 node.tag 来创建一个字符串字面量节点作为第一个参数
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ])
    // 处理 h 函数调用的参数
    node.children.length === 1
      // 如果当前标签节点只有一个子节点，则直接使用子节点的jsNode作为参数
      ? callExp.arguments.push(node.children[0].jsNode)
      // 如果当前标签节点有多个子节点，则创建一个ArrayExpression节点作为参数
      : callExp.arguments.push(
        // 数组的每个元素都是子节点的jsNode
        createArrayExpression(node.children.map(m => m.jsNode))
      )
    node.jsNode = callExp
  }
}

/*
* 转换逻辑编写在退出节点的回调函数内，这样才能保证其子节点全部被处理完毕
* 转换后的JavaScript AST节点都存储在节点的 node.jsNode 属性下
* */

/*
* 转换后得到的AST知识用来描述渲染函数render的返回值的，因此最后一步需要补全JavaScript AST，
*   即把用来描述 render 函数本身的函数声明语句节点附加到JavaScript AST中
* */
function transformRoot (node) {
  // 将逻辑编写在退出阶段的回调函数中，保证子节点全部被处理完毕
  return () => {
    if (node.type !== 'Root') return

    // node 是根节点，根节点的第一个子节点就是模板的根节点
    const vNodeJsAST = node.children[0].jsNode
    // 创建 render 函数的声明语句节点，将 vNodeJsAST 作为 render 函数体的返回语句
    node.jsNode = {
      type: 'FunctionDecl',
      id: { type: 'Identifier', name: 'render' },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vNodeJsAST
        }
      ]
    }
  }
}
