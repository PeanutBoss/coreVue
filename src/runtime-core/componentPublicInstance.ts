const publicPropertiesMap = {
    $el: i => i.vNode.el
}

export const PublicInstanceProxyHandlers = {
    get({_: instance}, key) {
        const { setupState } = instance
        // 如果setupState中存在这个属性就返回它的值
        if (key in setupState) {
            return setupState[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}
