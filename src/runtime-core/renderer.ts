import {createComponentInstance, setupComponent} from "./component";

export function render (vNode, container) {
  patch(vNode, container)
}

function patch (vNode, container) {
  // TODO 判断vNode是不是element
  if (typeof vNode.type === 'string') {
    processElement(vNode, container)
  } else {
    // 去处理组件
    processComponent(vNode, container)
  }
}

function processComponent (vNode, container) {
  mountComponent(vNode, container)
}

function mountComponent (vNode, container) {
  // 与mountElement同理，创建并返回一个组件对象
  const instance = createComponentInstance(vNode)

  // 处理setup中的信息（例如：实现代理this）
  setupComponent(instance)
  setupRenderEffect(instance, vNode, container)
}

function processElement (vNode, container) {
  mountElement(vNode, container)
}

function mountElement(vNode, container) {
  // $el：这里的虚拟节点时element类型的，也就是App中的根元素div；return instance.vNode.el中的虚拟节点是组件实例对象的虚拟节点
  // 创建对应的DOM，同时绑定到虚拟DOM上
  const el = vNode.el = document.createElement(vNode.type)
  // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
  if (typeof vNode.children === 'string') {
    el.textContent = vNode.children
  } else if (Array.isArray(vNode.children)) {
    // 如果是数组类型（说明有多个子元素），调用patch递归处理子节点
    mountChildren(vNode, el)
  }
  // 处理vNode对应的属性
  for (const key in vNode.props) {
    el.setAttribute(key, vNode.props[key])
  }
  // 将DOM添加到对应容器中
  container.appendChild(el)
}

// 当children为数组时，处理子节点
function mountChildren (vNode, container) {
  vNode.children.forEach(child => {
    patch(child, container)
  })
}

// 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象
function setupRenderEffect (instance, vNode, container) {
  // instance.render 来自于 finishComponentSetup 方法，就是组件的render方法
  // 绑定this，让render中的this指向创建的代理对象
  const subTree = instance.render.call(instance.proxy)
  // vNode -> patch
  // vNode -> element -> mountElement
  patch(subTree, container)

  // subTree指的就是class="root"的根节点
  // 子元素处理完成之后
  vNode.el = subTree.el
}
