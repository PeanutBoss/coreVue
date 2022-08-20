/* 递归下降算法构造模板AST */

const TextModes = {
  DATA: 'DATA',
  RCDATA: 'RCDATA',
  RAWTEXT: 'RAWTEXT',
  CDATA: 'CDATA'
}

function parse (str) {
  // 定义上下文对象
  const context = {
    // source 时模板内容，用于在解析过程中进行消费
    source: str,
    // 解析器当前处于文本模式，初始模式为DATA
    mode: TextModes.DATA
  }
  // 调用 parseChildren 函数开始进行解析，它返回解析后得到的子节点
  // 第一个参数是上下文对象。第二个参数是由父节点构成的节点站，初始时为空
  const nodes = parseChildren(context, [])

  return {
    type: 'Root',
    // 使用 nodes 作为根节点的 children
    children: nodes
  }
}

/*
* 创建 Token 与构造函数AST 的过程可以同时进行，因为模板和模板AST既有同构的特性
*
* parseChildren 函数是用来解析子节点的，因此 while 循环一定要遇到父级节点的结束标签才会停止
*   但这样存在一些问题
* */

function parseChildren (context, ancestors) {
  // 定义 nodes 数组存储子节点，他将作为最终的返回值
  let nodes = []
  // 从上下文对象中取得当前状态，包括模式 mode 和 模板内容 source
  const { mode, source } = context

  // 开启 while 循环，只要满足条件就会一直对字符串进行解析
  while (!isEnd(context, ancestors)) {
    let node
    // 只有DATA模式和RCDATA模式才支持插值节点的解析
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      // 只有 DATA 模式才支持标签节点的解析
      if (mode === TextModes.DATA && source[0] === '<') {
        if (source[i] === '!') {
          if (source.startsWith('<!--')) {
            // 注释
            node = parseComment(context)
          } else if (source.startsWith('<![CDATA[')) {
            // CDATA
            node = parseCDATA(context, ancestors)
          }
        } else if (source[1] === '/') {
          // 结束标签，这里需要抛出错误
        } else if (/[a-z]/i.test(source[1])) {
          // 标签
          node = parseElement(context, ancestors)
        }
      } else if (source.startsWith('{{')) {
        // 解析插值
        node = parseInterpolation(context)
      }
    }

    // node 不存在，说明处于其他模式，即非 DATA 模式且非 RCDATA 模式
    if (!node) {
      // 解析文本节点
      node = parseText(context)
    }
    // 将节点添加到 nodes 数组中
    nodes.push(node)
  }

  // 当 while 循环停止后，说明子节点解析完毕，返回子节点
  return nodes
}

function isEnd() {}

function parseElement () {
  // 解析开始标签
  const element = parseTag()
  // 递归地调用 parseChildren 函数进行 <div> 标签子节点的解析
  element.children = parseChildren()
  // 解析结束标签
  parseEndTag()
  return element
}
