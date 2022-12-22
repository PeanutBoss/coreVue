import { ShapeFlags } from './shapeFlags'

export function createVNode (type, props?, children?) {
  const vNode: any = {
    type,
    props: props || {},
    children,
    shapeFlag: getShapeFlag(type), // 初始化子节点标识：是组件还是元素
  }
  // 子节点是文本还是数组
  if (typeof children === 'string') {
    vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof vNode.children === 'object') {
      vNode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vNode
}

const getShapeFlag = (type) => typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
