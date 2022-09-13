import { NodeTypes } from "./ast";

enum TagType {
  Start,
  End
}

export function baseParse (content: string) {
  // 创建一个全局上下文对象
  const context = createParserContent(content)
  return createRoot(parseChildren(context))
}

function parseChildren (context) {

  const nodes: any = []
  let node
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    // 以 < 开头 且 < 后跟字母 说明遇到了标签
    if (/a-z/i.test(s[1])) {
      parseElement(context)
    }
    node = parseElement(context)
  }
  nodes.push(node)

  return nodes
}

function parseElement (context: any) {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)
  return element
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
  const closeIndex = context.source.indexOf(openDelimiter, openDelimiter.length)
  // 去掉前面两个字符 - {{
  advanceBy(context, openDelimiter.length)
  // 计算 closeIndex 的时候还没删除前面两个字符
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = context.source.slice(0, rawContentLength)
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
