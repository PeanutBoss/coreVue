import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initProps } from "./componentProps";
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'

export function createComponentInstance (vNode) {
  const component: any = {
    vNode,
    type: vNode.type,
    setupState: {},
    props: {},
    emit: () => {}
  }  
  component.emit = emit.bind(null, component)
  return component
}

export function setupComponent (instance) {
  // TODO
  initProps(instance, instance.vNode.props)
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
    // 因为传入的props是浅只读的，所以使用 shallowReadonly 包裹
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })

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
