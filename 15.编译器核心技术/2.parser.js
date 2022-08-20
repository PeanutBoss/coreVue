/*
* 根据token构造AST
* 根据模板解析后生成的Token构造出AST
* 维护一个栈ElementStack，用于维护元素间的父子关系
* */


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
