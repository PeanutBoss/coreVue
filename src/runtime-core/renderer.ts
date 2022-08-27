import { ShapeFlags } from "../share/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vNode";

export function render (vNode, container, parentComponent) {
  patch(vNode, container, parentComponent)
}

function patch (vNode, container, parentComponent) {
  // ShapeFlags - &
  const { shapeFlag, type } = vNode

  switch (type) {
    case Fragment:
      processFragment(vNode, container, parentComponent)
      break
    case Text:
      processText(vNode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vNode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 去处理组件
        processComponent(vNode, container, parentComponent)
      }
      break
  }
}

function processComponent (vNode, container, parentComponent) {
  mountComponent(vNode, container, parentComponent)
}

function mountComponent (vNode, container, parentComponent) {
  // 与mountElement同理，创建并返回一个组件对象
  const instance = createComponentInstance(vNode, parentComponent)

  // 处理setup中的信息（例如：实现代理this）
  setupComponent(instance)
  setupRenderEffect(instance, vNode, container, parentComponent)
}

function processElement (vNode, container, parentComponent) {
  mountElement(vNode, container, parentComponent)
}

function mountElement(vNode, container, parentComponent) {
  // $el：这里的虚拟节点是element类型的，也就是App中的根元素div；return instance.vNode.el中的虚拟节点是组件实例对象的虚拟节点
  // 创建对应的DOM，同时绑定到虚拟DOM上
  const el = vNode.el = document.createElement(vNode.type)
  const { children, shapeFlag } = vNode
  // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 如果是数组类型（说明有多个子元素），调用patch递归处理子节点
    mountChildren(vNode, el, parentComponent)
  }
  // 处理vNode对应的属性
  for (const key in vNode.props) {
    const val = vNode.props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  // 将DOM添加到对应容器中
  container.appendChild(el)
}

// 当children为数组时，处理子节点
function mountChildren (vNode, container, parentComponent) {
  vNode.children.forEach(child => {
    patch(child, container, parentComponent)
  })
}

function processFragment (vNode, container, parentComponent) {
  mountChildren(vNode, container, parentComponent)
}

function processText (vNode, container) {
  console.log(vNode, container)
  const { children } = vNode
  const textNode = vNode.el = document.createTextNode(children)
  container.append(textNode)
}

// 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象
function setupRenderEffect (instance, vNode, container, parentComponent) {
  // instance.render 来自于 finishComponentSetup 方法，就是组件的render方法
  // 绑定this，让render中的this指向创建的代理对象
  const subTree = instance.render.call(instance.proxy)
  // vNode -> patch
  // vNode -> element -> mountElement
  patch(subTree, container, instance)

  // subTree指的就是class="root"的根节点
  // 子元素处理完成之后
  vNode.el = subTree.el
}
