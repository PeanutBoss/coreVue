import { createRender } from '../runtime-core'

function createElement (type) {
    return document.createElement(type)
}

function patchProp (el, key, val) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
}

function insert (el, container) {
    container.append(el)
}

const renderer: any = createRender({
    createElement,
    patchProp,
    insert
})

export function createApp (...arg) {
    return renderer.createApp(...arg)
}

// runtime-dom 是属于 runtime-core 的上一层，它是基于dom平台做的处理，runtime-core是更通用的一层
// 将 runtime-core 在runtime-dom中导出
export * from '../runtime-core'
