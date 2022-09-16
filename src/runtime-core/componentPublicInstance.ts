import { hasOwn } from "../share/index";

const publicPropertiesMap = {
    $el: i => i.vNode.el,
    $slots: i => i.slots,
    $props: i => i.props
}

export const PublicInstanceProxyHandlers = {
    // 取出组件的实例对象 instance
    get({_: instance}, key) {
      // 从组件实例中取出 setupState（setup返回的数据） / props（传入当前组件的数据）
      const { setupState, props } = instance
      // 当通过代理对象访问某个属性时，会先从 setupState 中查找并返回
      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) { // 如果setupState中没有，则到props中查找并返回
        return props[key]
      }
      // 访问 $el、$slots、$props时，返回实例上对应的属性
      const publicGetter = publicPropertiesMap[key]
      if (publicGetter) {
        return publicGetter(instance)
      }
    }
}
