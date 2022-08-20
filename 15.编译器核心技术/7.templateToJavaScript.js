/* 将模板AST转为JavaScriptAST */

/*
* 本质上需要设计一些数据解构来描述渲染函数的代码
* */

const FunctionDeclNodeExample = {
  type: 'FunctionDecl', // 代表该节点是函数声明
  // 函数的名称是一个标识符，标识符本身也是一个节点
  id: {
    type: 'Identifier',
    name: 'render' // name用来存储标识符的名称
  },
  params: [], // 参数
  // 渲染函数的函数体只有一个语句，即return语句
  body: [
    {
      type: 'ReturnStatement',
      return: null
    }
  ]
}

// 描述函数调用语句
const CallExp = {
  type: 'CallExpression',
  // 被调用函数的名称，它是一个标识符
  callee: {
    type: 'Identifier',
    name: 'h'
  },
  // 参数
  arguments: []
}

// 为了方便观察渲染函数返回值
function render () {
  return h('div', [/* ... */])
}

// 描述字符串字面量
const str = {
  type: 'StringLiteral',
  value: 'div'
}

// 描述数组
const Arr = {
  type: 'ArrayExpression',
  // 数组中的元素
  elements: []
}

// 使用上面的三个表达式描述对象来填充渲染函数的返回值
const FunctionDeclNode = {
  type: 'FunctionDecl', // 代表节点是函数声明
  // 函数的名称是一个标识符，标识符本身也是一个节点
  id: {
    type: 'Identifier',
    name: 'render' // name用来存储标识符的名称，这里指的是渲染函数的名称 render
  },
  params: [], // 参数，目前渲染函数不需要参数
  body: [
    {
      type: 'ReturnStatement',
      // 最外层的 h 函数调用
      return: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'h' },
        arguments: [
          // 第一个参数是字符串字面量 'div'
          {
            type: 'StringLiteral',
            value: 'div'
          },
          // 第二个参数是一个数组
          {
            type: 'ArrayExpression',
            elements: [
              // 数组的第一个元素是 h 函数的调用
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h' },
                arguments: [
                  // 该 h 函数调用的第一个参数是字符串字面量
                  { type: 'StringLiteral', value: 'p' },
                  // 第二个参数也是一个字符串字面量
                  { type: 'StringLiteral', value: 'Vue' }
                ]
              },
              // 数组的第二个元素也是 h 函数的调用
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h' },
                arguments: [
                  // h 函数调用的第一个参数是字符串字面量
                  { type: 'StringLiteral', value: 'p' },
                  // 第二个参数也是一个字符串字面量
                  { type: 'StringLiteral', value: 'Template' }
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
