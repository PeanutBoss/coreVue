import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'

export function createComponentInstance (vNode, parent) {
  console.log(parent, 'parent')
  const component: any = {
    vNode,
    type: vNode.type,
    setupState: {},
    props: {},
    slots: {},
    providers: {},
    parent,
    emit: () => {}
  }
  component.emit = emit.bind(null, component)
  return component
}

export function setupComponent (instance) {
  // TODO
  initProps(instance, instance.vNode.props)
  initSlots(instance, instance.vNode.children)

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 第一次patch的时候instance.type就是传入的App组件
  const Component = instance.type

  // 创建一个代理对象用来拦截render函数中的this
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // currentInstance = instance
    setCurrentInstance(instance)
    // 因为传入的props是浅只读的，所以使用 shallowReadonly 包裹
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    // currentInstance = null
    setCurrentInstance(null)
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

let currentInstance = null

export function getCurrentInstance () {
  return currentInstance
}

export function setCurrentInstance (instance) {
  currentInstance = instance
}
