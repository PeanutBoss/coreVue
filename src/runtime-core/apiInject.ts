import { getCurrentInstance } from './component'

export function provide (key, value) {
    const { provides }: any = getCurrentInstance()
    provides[key] = value
    console.log(key, value)
}

export function inject (key) {
    const instance: any = getCurrentInstance()
    const parentProvides = instance.parent.provides
    return parentProvides && parentProvides[key]
}
