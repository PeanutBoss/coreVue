/* 状态机的开始与停止 */

function isEnd (context, ancestors) {
  // 当模板内容解析完毕后，停止
  if (!context.source) return true
  // 获取父级标签节点
  const parent = ancestors[ancestors.length - 1]
  // 如果遇到结束标签，并且该标签与父级标签节点同名，则停止
  if (parent && context.source.startsWith(`</${parent.tag}>`)) {
    return true
  }
}

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
          // 结束标签，这里需要抛出错误，因为缺少与之对应的开始标签
          console.error('无效的结束标签')
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

function parseElement (context, ancestors) {
  const element = parseTag(context)
  if (element.isSelfClosing) return element

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`)) {
    parseTag(context, 'end')
  } else {
    console.error(`${element.tag}标签缺少闭合标签`)
  }
  return element
}
