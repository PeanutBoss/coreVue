/*
* 实际上是数据的存取
* 存在当前的组件实例上
*
* provider/inject只能在setup下使用,因为只有才setup中才能获取到currentInstance
* */

/*
* provider查找时应该取的是离它最近的provider中的数据，没有的话才会向上级去查找（原型链）
* */

import { getCurrentInstance } from "./component";

export function provider (key, value) {
    // 存
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { providers } = currentInstance
        const parentProviders = currentInstance.parent.providers
        // 初始化的时候才会执行
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders)
        }
        providers[key] = value
    }
}

export function inject (key, defaultValue) {
    // 取
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers
        if (key in  parentProviders) {
            return parentProviders[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}
