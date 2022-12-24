import { createComponentInstance, setupComponent } from "./component";
import {Fragment, ShapeFlags} from './shapeFlags'
import {createVNode} from "./vNode";

export function render (vNode, container) {
  patch(vNode, container, null)
}

function patch (vNode, container, parentComponent) {
  const { type } = vNode
  switch (type) {
    case Fragment:
      processFragment(vNode, container, parentComponent)
      break
    case Text:
      processText(vNode, container)
      break
    default:
      if (vNode.shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vNode, container, parentComponent)
      } else if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vNode, container, parentComponent)
      }
      break
  }
}

function processComponent (vNode, container, parentComponent) {
  mountComponent(vNode, container, parentComponent)
}

function mountComponent(vNode, container, parentComponent) {
  const instance = createComponentInstance(vNode, parentComponent)

  setupComponent(instance)

  setupRenderEffect(instance, vNode, container)
}

function setupRenderEffect(instance, vNode, container) {
  // 获取虚拟节点树
  const subTree = instance.render()
  // 基于虚拟节点，进一步调用patch
  // vNode -> element -> mountElement

  patch(subTree, container, instance)

  vNode.el = subTree.el
}

function processElement (vNode, container, parentComponent) {
  mountElement(vNode, container, parentComponent)
}

function mountElement (vNode, container, parentComponent) {
  // mountElement会做的一些事
  // const el = document.createElement('div')
  // el.setAttribute('class', 'content')
  // document.body.append(el)

  const el = document.createElement(vNode.type)

  // 将真实DOM添加到元素对应的虚拟DOM上
  // console.log(vNode, '将el添加到html标签对应的虚拟DOM上了')
  vNode.el = el

  mountChildren(vNode, el, parentComponent)

  processProps(vNode, el)

  // 上树
  container.append(el)
}

function mountChildren (vNode, container, parentComponent) {
  // 处理内容
  if (vNode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    container.textContent = vNode.children
  } else if (vNode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    vNode.children.forEach(child => patch(child, container, parentComponent))
  }
}

function processProps (vNode, container) {
  // 处理属性
  for (const key in vNode.props) {
    const val = vNode.props[key]
    // 如果prop的key以 on+首字母大写开头，那么就认为是绑定一个事件
    if (/^on[A-Z]/.test(key)) {
      const eventName = key.slice(2).toLowerCase()
      container.addEventListener(eventName, val)
    } else {
      container.setAttribute(key, val)
    }
  }
}

function processFragment (vNode, container, parentComponent) {
  mountChildren(vNode, container, parentComponent)
}

function processText (vNode, container) {
  const { children } = vNode
  vNode.el = document.createTextNode(children)
  container.append(vNode.el)
}

export function renderSlots (slots, name, props = {}) {
  // 1/2 实现
  // return createVNode('div', {}, slots)
  // 3.具名插槽
  const slot = slots[name]
  // if (slot) return createVNode('div', {}, slot(props))

  // 如果使用div包裹会导致渲染出来的页面与代码结构不一致
  if (slot) return createVNode(Fragment, {}, slot(props))
}
