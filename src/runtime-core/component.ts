import { PublicInstanceHandlers } from './componentPublicInstance'
export function createComponentInstance (vNode) {
  const component = {
    vNode,
    type: vNode.type,
    setupState: {}
  }
  return component
}

export function setupComponent (instance) {
  // initProps()
  // initSlots()
  setupStateComponent(instance)
}

function setupStateComponent(instance) {
  // 组件的options
  const Component = instance.type

  const { setup } = Component
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}


// TODO typeof setupResult function/object
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup (instance) {
  const Component = instance.type

  // 为实例添加render函数的时候改变render函数中的this指向
  const proxy = new Proxy({ instance }, PublicInstanceHandlers)

  // if (Component.render) {}
  // 必须使用render函数，render一定是有值的
  instance.render = Component.render.bind(proxy)
}
