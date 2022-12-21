import { PublicInstanceHandlers } from './componentPublicInstance'
import {shallowReadonly} from "../reactivity/reactive";
import { emit } from "./emit";
import {ShapeFlags} from "./shapeFlags";
export function createComponentInstance (vNode) {
  const component: any = {
    vNode,
    type: vNode.type,
    setupState: {},
    slots: {},
    props: {},
    emit: null
  }
  component.emit = emit.bind(null, component)
  return component
}

export function setupComponent (instance) {
  initProps(instance, instance.vNode.props)
  initSlots(instance, instance.vNode.children)
  setupStateComponent(instance)
}

function setupStateComponent(instance) {
  // 组件的options
  const Component = instance.type

  const { setup } = Component
  if (setup) {
    const setupResult = setup(instance.props, instance)
    handleSetupResult(instance, setupResult)
  }
}

function initSlots (instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]
  // 3.具名插槽
  // const slots = {}
  // for (const key in children) {
  //   slots[key] = Array.isArray(children[key]) ? children[key] : [children[key]]
  // }
  const { vNode } = instance
  console.log(vNode, 'vNode')
  if (vNode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    // 4.作用域插槽
    const slots = {}
    for (const key in children) {
      const value = children[key]
      slots[key] = props => Array.isArray(value(props)) ? value(props) : [value(props)]
    }
    instance.slots = slots
  }
}


function initProps (instance, rawProps) {
  console.log(rawProps, 'rawProps')
  instance.props = shallowReadonly(rawProps)
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
