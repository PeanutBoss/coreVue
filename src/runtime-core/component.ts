import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance (vNode) {
  const component = {
    vNode,
    type: vNode.type,
    setupState: {}
  }
  return component
}

export function setupComponent (instance) {
  // TODO
  // initProps
  // initSlots

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 第一次patch的时候instance.type就是传入的App组件
  const Component = instance.type

  // 创建一个代理对象用来拦截render函数中的this
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult (instance, setupResult) {
  // TODO
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup (instance) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }

}
