/* 整合 */
const State = {
  initial: 1, // 初始状态
  tagOpen: 2, // 标签开始状态
  tagName: 3, // 标签名称状态
  text: 4, // 文本状态
  tagEnd: 5, // 结束标签状态
  tagEndName: 6 // 结束标签名称状态
}

function isAlpha (char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function tokenize (str) {
  // 状态机的当前状态，初始状态
  let currentState = State.initial
  // 用于缓存字符
  const chars = []
  // 生成的 Token 会存储到 tokens 数组中，并作为函数的返回值返回
  const tokens = []
  // 使用while循环开启自动机，只要模板字符串没有被消费完，自动机就会一直运行
  while (str) {
    // 查看第一个字符，只是查看，并没有消费该字符
    const char = str[0]
    switch (currentState) {
      // 处于初始状态
      case State.initial:
        if (char === '<') {
          // 状态机切换标签到开始状态
          currentState = State.tagOpen
          // 消费字符串
          str = str.slice(1)
        } else if (isAlpha(char)) {
          // 遇到字母，切换到文本状态
          currentState = State.text
          // 将当前字母缓存到chars数组
          chars.push(char)
          // 消费字符
          str = str.slice(1)
        }
        break
      case State.tagOpen:
        if (isAlpha(char)) {
          // 遇到字母，切换到标签开始状态
          currentState = State.tagName
          // 将当前字符缓存到chars数组
          chars.push(char)
          // 消费字符
          str = str.slice(1)
        } else if (char === '/') {
          // 遇到 / 字符，切换到结束标签状态
          currentState = State.tagEnd
          // 消费字符
          str = str.slice(1)
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          // 遇到字母，由于当前处于标签名称状态，所以不需要切换状态
          // 但需要将字符缓存到charts数组
          chars.push(char)
          // 消费字符串
          str = str.slice(1)
        } else if (char === '>') {
          // 遇到 > 字符切换到初始状态
          currentState = State.initial
          // 同时创建标签Token，并添加到tokens数组中，此时charts缓存的字符就是标签名称
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          // charts数组的内容被消费，清空它
          chars.length = 0
          // 消费当前字符
          str = str.slice(1)
        }
        break
      case State.text:
        if (isAlpha(char)) {
          // 遇到字母，当前字符添加到charts数组
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          // 遇到 <，切换到标签开始状态
          currentState = State.tagOpen
          // 此时创建文本Token，并添加到tokens数组，此时chars中的字符就是文本内容
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          // 遇到字母，切换到结束标签名称状态，但需要将当前字符川村到 chars 数组
          currentState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          // 将当前字符缓存到chars数组
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          // 遇到字符 >，切换到初始状态
          currentState = State.initial
          // 此时chars数组中缓存的内容就是标签名称
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }
  // 最后返回tokens
  console.log([...tokens], 'tokens')
  return tokens
}

function parser (str) {
  // 对模板进行表计划，得到tokens
  const tokens = tokenize(str)
  // 创建root根节点
  const root = {
    type: 'Root',
    children: []
  }
  // 创建elementStack，起初只有Root根节点
  const elementStack = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        // 如果当前是开始标签，则创建Element类型的AST节点
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        // 将其添加到父级节点的children中
        parent.children.push(elementNode)
        // 将当前节点压入栈
        elementStack.push(elementNode)
        break
      case 'text':
        // 如果是文本，则创建Text类型的节点
        const textNode = {
          type: 'Text',
          content: t.content
        }
        // 将其添加到父节点的children中
        parent.children.push(textNode)
        break
      case 'tagEnd':
        // 遇到结束标签，将栈顶节点弹出
        elementStack.pop()
        break
    }
    // 消费已经扫描过的token
    tokens.shift()
  }
  console.log(root, 'root')
  // 最后返回AST
  return root
}

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

function traverseNodeOld (ast) {
  const currentNode = ast
  const children = currentNode.children

  // 对当前节点进行操作
  if (currentNode.type === 'Element' && currentNode.tag === 'p') {
    // 例如将所有p标签转换为h1标签
    currentNode.tag = 'h1'
  }

  // 如果有子节点，递归调用traverseNode函数进行遍历
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i])
    }
  }
}

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

function transformOld (ast) {
  // 调用 traverseNode 完成转换
  traverseNode(ast)
  // 打印AST信息
  dump(ast)
}

function transform (ast) {
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
  // 打印AST信息
  dump(ast)
}

function transformElement (node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}

function transformTextV1 (node) {
  if (node.type === 'Text') {
    node.content = node.content.repeat(2)
  }
}

function transformText (node, context) {
  if (node.type === 'Text') {
    // 如果当前节点时文本节点，则调用 context.replaceNode 函数将其替换为元素节点
    context.replaceNode({
      type: 'Element',
      tag: 'span'
    })
  }
}

const ast = parser(`<div><p>Vue</p><p>Template</p></div>`)
transform(ast)
