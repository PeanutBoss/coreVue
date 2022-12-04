import { createVNode } from './vNode'
import { render } from './renderer'

export function createApp (rootComponent) {
  return {
    mount (rootContainer) {
      // 先转换为虚拟节点， component -> vNode， 所有操作基于虚拟节点
      const vNode = createVNode(rootComponent)

      render(vNode, rootContainer)
    }
  }
}
