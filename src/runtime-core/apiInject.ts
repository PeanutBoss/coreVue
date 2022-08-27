/*
* 实际上是数据的存取
* 存在当前的组件实例上
*
* provider/inject只能在setup下使用,因为只有才setup中才能获取到currentInstance
* */

import { getCurrentInstance } from "./component";

export function provider (key, value) {
    // 存
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const { providers } = currentInstance
        providers[key] = value
    }
}

export function inject (key) {
    // 取
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers
        return parentProviders[key]
    }
}
