import {createComponentInstance, setupComponent} from "./component";

export function render (vNode, container) {
  patch(vNode, container)
}

function patch (vNode, container) {
  // TODO 判断组件类型做对应处理
  processComponent(vNode, container)
}

function processComponent (vNode, container) {
  mountComponent(vNode, container)
}

function mountComponent(vNode, container) {
  const instance = createComponentInstance(vNode)

  setupComponent(instance)

  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // 获取虚拟节点树
  const subTree = instance.render()
  // 基于虚拟节点，进一步调用patch
  // vNode -> element -> mountElement
  patch(subTree, container)
}

