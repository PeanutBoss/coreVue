/* 代码生成 */

/*
* 根据JavaScript AST 生成渲染函数的代码
* */

function compile (template) {
  // 获取模板AST
  const ast = parser(template)
  // 将模板AST转换为JSAST
  transform(ast)
  const code = generator(ast.jsNode)
  return code
}

function generator (node) {
  const context = {
    // 存储最终生成的渲染函数代码
    code: '',
    // 生成代码时，通过push函数完成代码的拼接
    push (code) {
      context.code += code
    }
  }

  // 调用 genNode 函数完成代码生成的工作
  genNode(node, context)

  // 返回渲染函数代码
  return context.code
}

function generate (node) {
  const context = {
    code: '',
    push (code) {
      context.code += code
    },
    // 当前缩进级别，初始值为0，即没有缩进
    currentIndent: 0,
    // 该函数用来换行，即在代码字符串的后面追加 \n 字符
    // 换行是应该保留缩进，所以需要追加 currentIndent * 2 个空格字符
    newline () {
      context.code += '\n' + '  '.repeat(context.currentIndent)
    },
    // 用来缩进
    indent () {
      context.currentIndent++
      context.newline()
    },
    // 取消缩进
    deIndent () {
      context.currentIndent--
      context.newline()
    }
  }
  generator(node, context)
  return context.code
}

function genNode (node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break
  }
}

function genFunctionDecl (node, context) {
  const { push, indent, deIndent } = context
  push(`function ${node.id.name} `)
  push('(')
  genNodeList(node.params, context)
  push(')')
  push('{')
  indent()
  // 为函数整体生成代码
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push('}')
}

function ReturnStatement (node, context) {
  const { push } = context
  push('return ')
  genNode(node.return, context)
}

function genCallExpression (node, context) {
  const { push } = context
  const { callee, arguments: args } = node
  push(`${callee.name}(`)
  genNodeList(args, context)
  push(')')
}

function genStringLiteral (node, context) {
  const { push } = context
  push(`'${node.value}'`)
}

function genArrayExpression (node, context) {
  const { push } = context
  push('[')
  // 生成数组元素代码
  genNodeList(node.element, context)
  push(']')
}

function genNodeList (nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    genNode(node, context)
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}
