/* parser实现原理与状态机 */

const State = {
  initial: 1, // 初始状态
  tagOpen: 2, // 标签开始状态
  tagName: 3, // 标签名称状态
  text: 4, // 文本状态
  tagEnd: 5, // 结束标签状态
  tagEndName: 6 // 结束标签名称状态
}

// 辅助函数，判断是否字母
function isAlpha (char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

// 接收模板字符串作为参数，并将模板切割为 Token 返回
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
    switch (char) {
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
        } else if (chat === '>') {
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
  return tokens
}
