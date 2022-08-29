import { createRender } from '../runtime-core'

function createElement (type) {
    return document.createElement(type)
}

function patchProp (el, key, prevVal, nextVal) {
    console.log('patchProp')
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, nextVal)
    } else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }
    }
}

function insert (el, container) {
    container.append(el)
}

function remove (child) {
    const parent = child.parent
    if (parent) {
        parent.removeChild(child)
    }
}

function setElementText (el, text) {
    el.textContent = text
}

const renderer: any = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export function createApp (...arg) {
    return renderer.createApp(...arg)
}

// runtime-dom 是属于 runtime-core 的上一层，它是基于dom平台做的处理，runtime-core是更通用的一层
// 将 runtime-core 在runtime-dom中导出
export * from '../runtime-core'
