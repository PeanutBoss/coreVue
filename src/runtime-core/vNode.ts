import {ShapeFlags} from '../share/ShapeFlags'

export const Fragment = Symbol('Fragment')

export const Text = Symbol('Text')

export function createVNode (type, props?, children?) {
  const vNode = {
    type,
    props,
    children,
    component: null,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    el: null
  }
  if (typeof children === 'string') {
    vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  // slot - 组件&object
  if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vNode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vNode
}

function getShapeFlag (type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode (text: string) {
  return createVNode(Text, {}, text)
}
