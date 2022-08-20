/* 解析文本与节码HTML实体 - 解码命名字符引用 */

/*
* HTML实体总是以 & 开头，以 ; 结尾
* 也有不以 ; 结尾的
* */

// rawText：将被解码的文本内容    asAttr：是否作为属性值
function decodeHtml (rawText, asAttr = false) {
  let offset = 0
  const end = rawText.length
  // 解码后的文本作为返回值返回
  let decodeText = ''
  // 引用表中实体名称最大长度
  let maxCRNameLength = 0

  // advance 用于消费指定长度的文本
  function advance (length) {
    offset += length
    rawText = rawText.slice(length)
  }

  // 消费字符串，知道处理完毕
  while (offset < end) {
    /*
    * head[0] 有三种可能
    * &：命名字符引用
    * &#：十进制标识的数字字符引用
    * &#x：十六禁止标识的数字字符引用
    * */
    const head = /&(?:#x?)?/i.exec(rawText)
    // 如果没有匹配，说明已经没有需要解码的内容
    if (!head) {
      // 计算剩余内容长度
      const remaining = end - offset
      // 将剩余内容加导 decodeText 上
      decodeText += rawText.slice(0, remaining)
      // 消费剩余内容
      advance(remaining)
      break
    }

    // head.index 为匹配字符 & 在 rawText 中的位置索引
    // 截取字符 & 之前的内容加到 decodeText 上
    decodeText += rawText.slice(0, head.index)
    // 消费字符 & 之前的内容
    advance(head.index)

    // 如果满足条件，说明是命名字符引用，否则为数字字符引用
    if (head[0] === '&') {
      let name = ''
      let value
      // 字符 & 的下一个字符必须是 ASCII字母或数组，才是合法的命名字符引用
      if (/[0-9a-z]/i.test(rawText[1])) {
        // 根据引用表计算实体名称的最大长度
        if (!maxCRNameLength) {
          maxCRNameLength = Object.keys(namedCharacterReference).reduce(
            (max, name) => Math.max(max, name, length), 0
          )
        }
        // 从最大长度开始对文本进行截取，并视图取引用表中找到对应的项
        for (let length = maxCRNameLength; !value && length > 0; --length) {
          // 截取字符 & 到最大长度之间的字符作为实体名称
          name = rawText.substr(1, length)
          // 使用实体名称去索引表中查找对应项的值
          value = (namedCharacterReference)[name]
        }
        // 如果找到对应的项，说明解码成功
        if (value) {
          // 检查实体名称最后一个匹配字符是否是分号
          const semi = name.endsWith(';')
          // 如果作为属性值 最后一个匹配字符不是分号
          // 并且最后一个字符的下一个字符是 等号、ASCII字母或数组
          // 将 & 和实体名称 name 作为普通文本
          if (asAttr && !semi && /[=a-z0-9]/i.test(rawText[name.length + 1] || '')) {
            decodeText += '&' + name
            advance(1 + name.length)
          } else {
            // 其他情况下，正常使用解码后的内容拼接到 decodeText 上
            decodeText += value
            advance(1 + name.length)
          }
        } else {
          // 如果没有找到对应的值，说明解码失败
          decodeText += '&' + name
          advance(1 + name.length)
        }
      } else {
        // 如果字符 & 的下一个字符不是 ASCII 字母或数组，则将 & 作为普通文本
        decodeText += '&'
        advance(1)
      }
    }
  }
  return decodeText
}
