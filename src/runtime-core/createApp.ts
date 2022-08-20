import {createVNode} from "./vNode";
import {render} from "./renderer";

export function createApp (rootComponent) {
  // debugger
  return {
    // 接收一个element实例作为根容器，整体入口
    mount (rootContainer) {
      // 先转vNode  component -> vNode
      // 所有逻辑操作都会基于vNode做处理
      const vNode = createVNode(rootComponent)
      render(vNode, rootContainer)
    }
  }
}
