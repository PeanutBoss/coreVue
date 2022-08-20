/* 卸载操作 */

const app = document.querySelector('#app')
    // 初次挂载
renderer.render(vNode, app)
    // 新vNode为null，意味着卸载之前渲染的内容
renderer.render(null, app)

function render(vNode, container) {
    if (vNode) {
        patch(container._vNode, vNode, container)
    } else { // 传入null时，什么都不渲染，需要卸载之前渲染的内容
        if (container._vNode) {
            container.innerHTML = ''
        }
    }
    container._vNode = vNode
}
/*
 * 当vNode为null时，并且 container._vNode 存在时，直接通过innerHTML清空容器不够严谨。
 *   - 容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件地beforeUnmount、
 *     unmounted等声明周期函数
 *   - 即使内容不是由组件渲染地，有的元素可能存在自定义指令，应该在卸载操作发生时正确执行对应指令钩子函数
 *   - 使用innerHTML清空容器元素内容地另一个缺陷，它不会移除绑定在DOM元素上的事件处理函数
 * 正确地卸载方式应该是根据vNode对象获取与其相关的真实 DOM 元素，然后使用原生DOM操作方法将该DOM元素移除。
 * */

function mountElement(vNode, container) {
    // 让vNode.el引用真实DOM元素
    const el = vNode.el = createElement(vNode.type)
    if (typeof vNode.children === 'string') {
        setElementText(el, vNode.children)
    } else if (Array.isArray(vNode.children)) {
        vNode.children.forEach(child => {
            patch(null, child, el)
        })
    }

    if (vNode.props) {
        for (const key in vNode.props) {
            patchProps(el, key, null, vNode.props[key])
        }
    }
    insert(el, container)
}

/*
 * createElement 创建真实DOM元素时，会把真实DOM元素赋值给vNode.el属性。在vNode与真实DOM之间旧建立了联系，
 *   可以通过vNode.el来获取该虚拟节点对应地真实DOM元素。
 * */

// 通过removeChild移除el
function renderV2(vNode, container) {
    if (vNode) {
        patch(container._vNode, vNode, container)
    } else {
        if (container._vNode) {
            // 根据vNode获取要卸载地真实DOM元素
            const el = container._vNode.el
                // 获取el的父元素
            const parent = el.parentNode
                // 调用 removeChild 移除元素
            if (parent) parent.removeChild(el)
        }
    }
    container._vNode = vNode
}

/*
 * 卸载操作封装到unmount中
 *   - unmount内，有机会调用绑定在DOM上的指令钩子函数，例如before-unmount
 *   - unmount执行时，可以检测虚拟节点的类型。如果描述的是组件，则有机会调用相关声明周期函数
 * */
function unmount(vNode) {
    // 获取虚拟节点对应真实DOM的父节点
    const parent = vNode.el.parentNode
    if (parent) {
        // 移除虚拟节点对应的真实DOM
        parent.removeChild(vNode.el)
    }
}

// 版本3
function renderV3(vNode, container) {
    if (vNode) {
        patch(container._vNode, vNode, container)
    } else {
        if (container._vNode) {
            // 调用unmount移除
            unmount(container._vNode)
        }
    }
    container._vNode = vNode
}
