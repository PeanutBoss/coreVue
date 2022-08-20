/* HTML的Attributes 和 DOM的Properties */

/*
 * HTML的 Attributes 指的是定义在HTML标签上的属性，比如 id="input"、type="text"、value="10"。当浏览器解析HTML后，
 *   会创建一个与之相符的DOM元素对象。
 * */
const html = `<input id="input" type="text" value="10"/>`
const el = document.querySelector('#app')
    // 这个DOM对象会包含很多属性，这些属性就是DOM Properties。
    // 例如 el.type、el.id、el.value都与其一一对应。

/*
 * 但并不是所有HTML Attributes 与DOM Properties 之间都是直接映射的关系。
 * 例如：class -> className      value -> value & defaultValue
 * */

/* 正确设置元素属性 */
// 渲染器不应该总是使用setAttribute函数将vNode.props对象中的属性设置到元素上。

function mountElementV1(vNode, container) {
    const el = createElement(vNode.type)

    // 省略children的处理

    if (vNode.props) {
        for (const key in vNode.props) {
            // 用 in 操作符判断DOM是否存在对应的Properties
            if (key in el) {
                // 获取该 Properties 的类型
                const type = typeof el[key]
                const value = vNode.props[key]
                    // 如果是不二类型，并且值为空字符串，则将值矫正为true
                if (type === 'boolean' && value === '') {
                    el[key] = true
                } else {
                    el[key] = value
                }
            } else {
                // 如果要设置的属性没有对应的 Properties，则使用 色图Attribute 设置属性
                el.setAttribute(key, vNode.props[key])
            }
        }
    }
}

const HTML = `
  <form id="form1"></form>
  <input type="text" form="form1">
`
    /*
     * 为input标签设置了form属性（HTML Attribute）。对应的DOM Properties是 el.form，但el.form是只读的，
     *   因此只能通过setAttribute函数来设置它。
     * 创建 shouldSetAsProps 函数，返回一个布尔值，代表属性是否应该作为DOMProperties被设置。
     *   如果返回true，应该作为DOM Properties 被设置，否则应该使用 setAttribute 来设置。
     * */
function shouldSetAsProps(el, key, value) {
    // 特殊处理
    if (key === 'form' && el.tagName === 'INPUT') return false
        // 兜底
    return key in el
}

function mountElementV2(vNode, container) {
    const el = createElement(vNode.type)

    // 省略children的处理

    if (vNode.props) {
        for (const key in vNode.props) {
            if (key in el) {
                const type = typeof el[key]
                const value = vNode.props[key]
                    // 使用 shouldSetAsProps 判断是否应该作为DOM Properties设置
                if (shouldSetAsProps(el, key, value)) {
                    el[key] = true
                } else {
                    el[key] = value
                }
            } else {
                el.setAttribute(key, vNode.props[key])
            }
        }
    }
}