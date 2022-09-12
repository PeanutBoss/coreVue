import { NodeTypes } from "./ast";

export function baseParse (content: string) {
  // 创建一个全局上下文对象
  const context = createParserContent(content)
  return createRoot(parseChildren(context))
}

function parseChildren (context) {

  const nodes: any = []
  let node
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  nodes.push(node)

  return nodes
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
