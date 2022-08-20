/* 解析标签节点 */

function parseElement (context, ancestors) {
  // 调用 parseTag 函数解析开始标签
  const element = parseTag(context)
  if (element.isSelfClosing) return element

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`)) {
    // 再次调用 parseTag 函数解析结束标签，传递了第二个参数：'end'
    parseTag(context, 'end')
  } else {
    console.error(`${element.tag}标签缺少闭合标签`)
  }
}

function parse (str) {
  const context = {
    // 模板内容
    source: str,
    mode: TextModes.DATA,
    // advanceBy 函数用来消费指定数量的字符，它接收一个数字作为参数
    advanceBy (num) {
      // 根据给定字符数，截取位置num后的模板内容，并替换当前模板内容
      context.source = context.source.slice(num)
    },
    // 无论开始还是结束，都可能存在无用的空白字符，如 <div   >
    advanceSpaces () {
      // 匹配空白字符
      const match = /^[\t\r\n\f ]+/.exec(context.source)
      if (match) {
        context.advanceBy(match[0].length)
      }
    }
  }

  const nodes = parseChildren(context, [])

  return {
    type: 'Root',
    children: nodes
  }
}

function parseTag (context, type = 'start') {
  const { advanceBy, advanceSpaces } = context

  // 处理开始标签和结束标签的正则表达式不同
  const match = type === 'start'
    // 匹配开始标签
    ? /^<([a-z][^\t\r\f\n />]*)/i.exec(context.source)
    // 匹配结束标签
    : /\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  // 匹配成功后，正则表达式的第一个不过组的值就是标签名称
  const tag = match[1]
  // 消费正则表达式匹配的全部内容，例如 '<div'
  advanceBy(match[0].length)
  // 消费标签中无用的空白字符
  advanceSpaces()
  // 在消费匹配的内容后，如果字符串以 '/>' 开头，则说明这是一个自闭和标签
  const isSelfClosing = context.source.startsWith('/>')
  // 如果是自闭和标签，则消费 '/>'，否则消费 '>'
  advanceBy(isSelfClosing ? 2 : 1)

  // 返回标签节点
  return {
    type: 'Element',
    // 标签名称
    tag,
    // 标签的属性暂时留空
    props: [],
    // 子节点留空
    children: [],
    // 是否自闭和
    isSelfClosing
  }
}

function parseElementV2 (context, ancestors) {
  // 调用 parseTag 函数解析开始标签
  const element = parseTag(context)
  if (element.isSelfClosing) return element

  // 切换到正确的文本模式
  if (element.tag === 'textarea' || element.tag === 'title') {
    // 如果有 parseTag 解析得到的标签是 textarea title，则切换到RCDATA模式
    context.mode = TextModes.RCDATA
  } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
    // 如果有 parseTag 解析得到的是这些标签，则切换到 RAWTEXT 模式
    context.mode = TextModes.RAWTEXT
  } else {
    // 否则切换到 DATA 模式
    context.mode = TextModes.DATA
  }

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`)) {
    // 再次调用 parseTag 函数解析结束标签，传递了第二个参数：'end'
    parseTag(context, 'end')
  } else {
    console.error(`${element.tag}标签缺少闭合标签`)
  }
}
