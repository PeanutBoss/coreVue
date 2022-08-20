/* 解析文本与节码HTML实体 - 解析文本 */

function parseText (context) {
  // endIndex 为文本内容的结尾索引，默认将整个模板剩余内容都作为文本内容
  let endIndex = context.source.length
  // 寻找字符 < 的位置索引
  const ltIndex = context.source.indexOf('<')
  // 寻找定界符 {{ 的位置索引
  const delimiterIndex = context.source.indexOf('{{')

  // 取 ltIndex 和 endIndex 中较小的一个作为新的结尾索引
  if (ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex
  }
  // 取 delimiterIndex 和 endIndex 中较小的作为新的结尾索引
  if (delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex
  }

  // 调用slice截取文本内容
  const content = context.source.slice(0, endIndex)
  // 消耗文本内容
  context.advanceBy(content.length)
  // 返回文本节点
  return {
    // 节点类型
    type: 'Text',
    content
  }
}
