import { NodeTypes } from "./ast";

enum TagType {
  Start,
  End
}

export function baseParse (content: string) {
  // 创建一个全局上下文对象
  const context = createParserContent(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren (context, ancestors) {

  const nodes: any = []

  // TODO
  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 以<开头 且 <后跟字母 说明遇到了标签
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }
    console.log(node, 'node')
    // 如果 node 没有值，则当作text解析
    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}

// 循环是否结束
function isEnd (context, ancestors) {
  // 1.遇到结束标签的时候
  // 2.source没有值的时候
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag // 取出当前tag
      if (startsWithEndTagOpen(s, tag)) { // 如果
        return true
      }
    }
  }
  return !s
}

function parseText (context) {
  let endTokens = ['<', '{{']
  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    // 判断是否遇到 {{，如果遇到了更新endIndex
    // endIndex 尽可能的小
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData (context, length) {
  // 1.获取当前内容
  const content = context.source.slice(0, length)
  // 2.更新进度
  advanceBy(context, length)
  return content
}

function parseElement (context: any, ancestors) {
  const element: any = parseTag(context, TagType.Start)

  // 这里进入一个新的标签内
  ancestors.push(element)
  // 添加children
  element.children = parseChildren(context, ancestors)
  // 处理完一个标签从栈中弹出
  ancestors.pop()

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签：${element.tag}`)
  }
  return element
}

function startsWithEndTagOpen (source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag (context, type: TagType) {
  // 1.解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 2.删除处理完的部分
  advanceBy(context, match[0].length) // 处理 <div 部分
  advanceBy(context, 1) // 处理右尖括号

  if (type === TagType.End) return

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseInterpolation (context) {

  const openDelimiter = '{{'
  const closeDelimiter = '}}'
  // 总督下标为2的字符开始截取 - 排除{{
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  // 去掉前面两个字符 - {{
  advanceBy(context, openDelimiter.length)
  // 计算 closeIndex 的时候还没删除前面两个字符
  const rawContentLength = closeIndex - openDelimiter.length
  // const rawContent = context.source.slice(0, rawContentLength)
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()

  // 将处理后的字符全部删掉 - 因为已经删了{{，所以需要用 rawContentLength+2 删除 插值和}} 内容
  advanceBy(context, rawContentLength + closeDelimiter.length)
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function advanceBy (context, length) {
  context.source = context.source.slice(length)
}

function createRoot (children) {
  return {
    children
  }
}

function createParserContent (content: string): any {
  return {
    source: content
  }
}
