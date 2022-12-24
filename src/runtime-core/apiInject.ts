import { getCurrentInstance } from './component'

export function provide (key, value) {
    const currentInstance: any = getCurrentInstance()
    const parentProvides = currentInstance.parent.provides
    if (currentInstance) {
        let { provides } = currentInstance
        // 创建组件实例时：由 `provides: parent ? parent.provides : {}` 得出
        // 如果当前组件的 provides 等于父组件的 provides，则说明当前组件的provides没有被初始化
        if (provides === parentProvides) {
            // 将父组件的provides作为当前组件provides的原型对象
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject (key, defaultValue) {
    const instance: any = getCurrentInstance()
    const parentProvides = instance.parent.provides
    // return parentProvides && parentProvides[key]
    if (!(key in parentProvides)) {
        if (typeof defaultValue === 'function') {
            return defaultValue()
        }
        return defaultValue
    }
    return parentProvides[key]
}
