import { toHandleKey, camelize } from '../share/index.js'

export function emit (instance, event, ...args) {
    console.log('emit', event)
    const { props } = instance

    // Tpp - 先写特定的行为 -> 重构成通用的行为
    // add -> Add
    // add-foo -> AddFoo
    const handlerName = toHandleKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...args)
}
