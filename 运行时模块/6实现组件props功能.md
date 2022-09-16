### 实现组件props功能

```typescript
export function setupComponent (instance) {
  // TODO
  initProps(instance, instance.vNode.props)
  // initSlots

  setupStatefulComponent(instance)
}
```

```typescript
function setupStatefulComponent(instance) {
  // 第一次patch的时候instance.type就是传入的App组件
  const Component = instance.type

  // 创建一个代理对象用来拦截render函数中的this
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // 因为传入的props是浅只读的，所以使用 shallowReadonly 包裹
    const setupResult = setup(shallowReadonly(instance.props))

    handleSetupResult(instance, setupResult)
  }
}
```

```typescript
// 将没有处理过的props给到instance
export function initProps(instance, rawProps) {
  instance.props = rawProps || {}
  // attrs
}
```

```typescript
export const PublicInstanceProxyHandlers = {
    get({_: instance}, key) {
      const { setupState, props } = instance

      const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
      const publicGetter = publicPropertiesMap[key]
      if (publicGetter) {
        return publicGetter(instance)
      }
    }
}
```

