const publicPropertiesMap = {
    '$el': instance => instance.vNode.el
}

export const PublicInstanceHandlers = {
    get({ instance }, key) {
        if (key in instance.setupState) {
            return instance.setupState[key]
        }
        const result = publicPropertiesMap[key]
        if (result) return result(instance)
    }
}
