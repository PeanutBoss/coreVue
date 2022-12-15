export function createComponentInstance (vNode) {
  const component = {
    vNode,
    type: vNode.type
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

  // if (Component.render) {}
  // 必须使用render函数，render一定是有值的
  instance.render = Component.render
}
