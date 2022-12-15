import { createComponentInstance, setupComponent } from "./component";

export function render (vNode, container) {
  patch(vNode, container)
}

function patch (vNode, container) {
  // TODO 判断是组件类型还是普通标签

  if (typeof vNode.type === 'string') {
    processElement(vNode, container)
  } else if (typeof vNode.type === 'object') {
    processComponent(vNode, container)
  }
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

function processElement (vNode, container) {
  mountElement(vNode, container)
}

function mountElement (vNode, container) {
  // mountElement会做的一些事
  // const el = document.createElement('div')
  // el.setAttribute('class', 'content')
  // document.body.append(el)

  const el = document.createElement(vNode.type)

  const { children, props } = vNode
  mountChildren(vNode, el)

  patchProps(vNode, el)

  // 上树
  container.append(el)
}

function mountChildren (vNode, container) {
  // 处理内容
  if (typeof vNode.children === 'string') {
    container.textContent = vNode.children
  } else if (Array.isArray(vNode.children)) {
    vNode.children.forEach(child => patch(child, container))
  }
}

function patchProps (vNode, container) {

  // 处理属性
  for (const key in vNode.props) {
    const val = vNode.props[key]
    container.setAttribute(key, val)
  }
}
