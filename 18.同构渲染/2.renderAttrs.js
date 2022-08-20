/* 严谨渲染属性 */

function renderElementVnode (vNode) {
  const { type: tag, props, children } = vNode
  const isVoidElement = VOID_TAGS.includes(tag)
  let ret = `<${tag}>`
  if (props) {
    ret += renderAttrs(props)
  }
  ret += isVoidElement ? '/>' : '>'
  if (isVoidElement) return ret

  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVnode(child)
    })
  }
  ret += `</${tag}>`
  return ret
}

// 应该忽略的属性
const shouldIgnoreProp = ['key', 'ref']

function renderAttrs (props) {
  let ret = ''
  for (const key in props) {
    // 如果是事件或应该被忽略的属性，则跳过
    if (
      shouldIgnoreProp.includes(key) ||
      /^on[^a-z]/.test(key)
    ) {
      continue
    }
    const value = props[key]
    // 调用 renderDynamicAttr 完成属性的渲染
    ret += renderDynamicAttr(key, value)
  }
  return ret
}

// 判断属性是否是布尔类型的（）省略了一部分
const isBooleanAttr = key => (`itemscope, allowfullscreen,formnvalidate,ismap,nomodule,novalidate,readonly` +
`,async,autofocus,autoplay`).split('.').includes(key)

// 判断属性名称是狗合法且安全
const isSSRSafeAttrName = key => !/[>/="'\u0009\u000a\u000c\u0020]/.test(key)

function renderDynamicAttr (key, value) {
  if (isBooleanAttr(key)) {
    return value === false ? '' : ` ${key}`
  } else if (isSSRSafeAttrName(key)) {
    // 对于其他安全的属性，执行完整渲染
    return value === '' ? `${key}` : `${key}=${escapeHtml(value)}`
  } else {
    // 跳过不安全的属性，并打印警告信息
    console.warn('属性不安全')
  }
}

const escapeRE = /["'&<>]/
function escapeHtml (string) {
  const str = '' + string
  const match = escapeRE.exec(str)

  if (!match) {
    return str
  }

  let html = ''
  let escaped, index, lastIndex = 0
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escaped = '&quot'
        break
      case 38: // &
        escaped = '&amp'
        break
      case 39: // '
        escaped = '&#39'
        break
      case 60: // <
        escaped = '&lt'
        break
      case 62: // >
        escaped = '&gt'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }
    lastIndex = index + 1
    html += escaped
  }
  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}
