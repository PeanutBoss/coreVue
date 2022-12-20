const publicPropertiesMap = {
    '$el': instance => instance.vNode.el,
    '$slots': instance => instance.slots
}

export const PublicInstanceHandlers = {
    get({ instance }, key) {
        if (key in instance.setupState) {
            return instance.setupState[key]
        }
        if (key in instance.props) {
          return instance.props[key]
        }
        const result = publicPropertiesMap[key]
        if (result) return result(instance)
    }
}
