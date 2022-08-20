/* 挂载子节点和元素的属性 */

function mountElement(vNode, container) {
    const el = createElement(vNode.type)
    if (typeof vNode.children === 'string') {
        setElementText(el, vNode.children)
    } else if (Array.isArray(vNode.children)) {
        vNode.children.forEach(child => {
            // 如果child是数组，则遍历每一个子节点，并调用patch函数挂载它们
            patch(null, child, el)
        })
    }
}
/*
 * - 传递给 patch 函数的第一个参数是null。因为是挂载阶段，没有旧vNode，所以只需要传递null，
 *   这样patch函数执行时，就会递归调用mountElement函数完成挂载。
 * - 传递给 patch 函数的第三个参数是挂载点。由于正在挂载的子元素是div标签的子节点，所以需要把刚刚
 *   创建的div元素作为挂载点，这样才能保证这些子节点话再到正确位置。
 * */

// 版本二
function mountElementV2(vNode, container) {
    const el = createElement(vNode.type)

    // 省略children的处理

    if (vNode.props) {
        for (const key in vNode.props) {
            // 调用 setAttribute 将属性设置到元素上
            el.setAttribute(key, vNode.props[key])
                // 或者通过DOM对象直接设置
                // el[key] = vNode.props[key]
        }
    }
    insert(el, container)
}

// 无论是使用 setAttribute 还是通过DOM对象直接设置都存在缺陷。
