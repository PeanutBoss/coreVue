/*
 * 封装
 * 最后，像在自定义渲染器中那样，需要把属性的设置变得与平台无关，因此需要把属性设置相关操作提取到
 *   渲染器选项中。
 * */

const parameters = {
    createElement(tag) {
        return document.createElement(tag)
    },
    setElement(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    // 将属性设置相关操作封装到patchProps函数中，并作为渲染器选项传递
    patchProps(el, key, preValue, nextValue) {
        if (shouldSetAsProps(el, key, nextValue)) {
            const type = typeof el[key]
            if (typeof type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    }
}

const renderer = createRenderer(parameters)

// 在mountElement函数中，只需要调用patchProps函数
function mountElement(vNode, container) {
    const el = createElement(vNode.type)
    if (typeof vNode.children === 'string') {
        setElementText(el, vNode.children)
    } else if (Array.isArray(vNode.children)) {
        vNode.children.forEach(child => {
            patch(null, child, el)
        })
    }

    if (vNode.props) {
        for (const key in vNode.props) {
            // 直接调用 patchProps 函数
            patchProps(el, key, null, vNode.props[key])
        }
    }

    insert(el, container)
}
