/* 将虚拟DOM渲染为HTML字符串 */

// 接收描述 普通标签 的虚拟节点作为参数，返回选然后的HTML字符串
function renderElementVnodeV1 (vNode) {
  // 取出标签名称tag和标签属性props，以及标签的子节点
  const { type: tag, props, children } = vNode
  // 开始标签的头部
  let ret = `<${tag}>`
  // 处理标签属性
  if (props) {
    for (const key in props) {
      // key="value"的形式拼接字符串
      ret += `${key}="${props[key]}"`
    }
  }
  // 开始标签的闭合
  ret += '>'
  // 处理子节点
  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVnode(child)
    })
  }

  // 结束标签
  ret += `</${tag}>`
  // 返回拼接好的HTML字符串
  return ret
}
// 将普通标签类型的虚拟节点渲染为HTML字符串，本质上时字符串的拼接。

// 自闭合标签
const VOID_TAGS = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',')

function renderElementVnodeV2 (vNode) {
  // 取出标签名称tag和标签属性props，以及标签的子节点
  const { type: tag, props, children } = vNode
  // 是否自闭和
  const isVoidElement = VOID_TAGS.includes(tag)
  // 开始标签的头部
  let ret = `<${tag}>`
  // 处理标签属性
  if (props) {
    for (const key in props) {
      // key="value"的形式拼接字符串
      ret += `${key}="${props[key]}"`
    }
  }
  // 如果是自闭合
  ret += isVoidElement ? '/>' : '>'
  // 自闭和不会由children
  if (isVoidElement) return ret

  // 处理子节点
  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVnode(child)
    })
  }

  // 结束标签
  ret += `</${tag}>`
  // 返回拼接好的HTML字符串
  return ret
}
