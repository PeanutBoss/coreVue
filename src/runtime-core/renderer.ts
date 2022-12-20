import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from './shapeFlags'
import {createVNode} from "./vNode";

export function render (vNode, container) {
  patch(vNode, container)
}

function patch (vNode, container) {
  // TODO 判断是组件类型还是普通标签
  if (vNode.shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vNode, container)
  } else if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vNode, container)
  }
}

function processComponent (vNode, container) {
  mountComponent(vNode, container)
}

function mountComponent(vNode, container) {
  const instance = createComponentInstance(vNode)

  setupComponent(instance)

  setupRenderEffect(instance, vNode, container)
}

function setupRenderEffect(instance, vNode, container) {
  // 获取虚拟节点树
  const subTree = instance.render()
  // 基于虚拟节点，进一步调用patch
  // vNode -> element -> mountElement

  patch(subTree, container)

  vNode.el = subTree.el
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

  // 将真实DOM添加到元素对应的虚拟DOM上
  // console.log(vNode, '将el添加到html标签对应的虚拟DOM上了')
  vNode.el = el

  mountChildren(vNode, el)

  processProps(vNode, el)

  // 上树
  container.append(el)
}

function mountChildren (vNode, container) {
  // 处理内容
  if (vNode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    container.textContent = vNode.children
  } else if (vNode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    vNode.children.forEach(child => patch(child, container))
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

export function renderSlots (slots) {
  return createVNode('div', {}, slots)
}
