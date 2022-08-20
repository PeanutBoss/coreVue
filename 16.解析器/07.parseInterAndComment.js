/* 解析插值与注释 */

function parseInterpolation (context) {
  // 消费开始定界符
  context.advanceBy('{{'.length)
  // 找到结束定界符的位置索引
  const closeIndex = context.source.indexOf('}}')
  if (closeIndex < 0) {
    console.error('插值缺少结束定界符')
  }
  // 截取开始定界符与结束定界符之间的内容作为插值表达式
  const content = context.source.slice(0, closeIndex)
  // 消费表达式的内容
  context.advanceBy(context.length)
  // 消费结束标签的内容
  context.advanceBy('{{'.length)

  // 返回类型 Interpolation 的节点，代表插值节点
  return {
    type: 'Interpolation',
    // 表达式节点的内容则是经过HTML解码后的插值表达式
    content: decodeHtml(content)
  }
}

function parseComment (context) {
  context.advanceBy('<!--'.length)
  const closeIndex = context.source.indexOf('-->')
  const content = context.source.slice(0, closeIndex)
  context.advanceBy(content.length)
  context.advanceBy('-->'.length)
  return {
    type: 'Comment',
    content
  }
}
