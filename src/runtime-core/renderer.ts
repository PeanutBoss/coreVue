import { ShapeFlags } from "../share/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vNode"
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'
import { EMPTY_OBJECT } from '../share'

export function createRender (options) {

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render (vNode, container) {
    patch(null, vNode, container, null, null)
  }

  /*
  * oldVNode - 不存在说明初始化，存在说明更新
  * */
  function patch (oldVNode, vNode, container, parentComponent, anchor) {
    // ShapeFlags - &
    const { shapeFlag, type } = vNode

    switch (type) {
      case Fragment:
        processFragment(oldVNode, vNode, container, parentComponent, anchor)
        break
      case Text:
        processText(oldVNode, vNode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, vNode, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 去处理组件
          processComponent(oldVNode, vNode, container, parentComponent, anchor)
        }
        break
    }
  }

  function processComponent (oldVNode, vNode, container, parentComponent, anchor) {
    mountComponent(vNode, container, parentComponent, anchor)
  }

  function mountComponent (vNode, container, parentComponent, anchor) {
    // 与mountElement同理，创建并返回一个组件对象
    const instance = createComponentInstance(vNode, parentComponent)

    // 处理setup中的信息（例如：实现代理this）
    setupComponent(instance)
    setupRenderEffect(instance, vNode, container, anchor)
  }

  function processElement (oldVNode, vNode, container, parentComponent, anchor) {
    if (!oldVNode) {
      mountElement(vNode, container, parentComponent, anchor)
    } else {
      patchElement(oldVNode, vNode, container, parentComponent, anchor)
    }
  }

  function mountElement(vNode, container, parentComponent, anchor) {
    // $el：这里的虚拟节点是element类型的，也就是App中的根元素div；return instance.vNode.el中的虚拟节点是组件实例对象的虚拟节点
    // 创建对应的DOM，同时绑定到虚拟DOM上
    const el = vNode.el = hostCreateElement(vNode.type)
    const { children, shapeFlag } = vNode
    // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 如果是数组类型（说明有多个子元素），调用patch递归处理子节点
      mountChildren(vNode.children, el, parentComponent, anchor)
    }
    // 处理vNode对应的属性
    for (const key in vNode.props) {
      const val = vNode.props[key]
      hostPatchProp(el, key, null, val)
    }
    // 将DOM添加到对应容器中
    hostInsert(el ,container, anchor)
  }

  function patchElement(oldVNode, vNode, container, parentComponent, anchor) {
    console.log('patchElement')
    console.log('oldVNode', oldVNode)
    console.log('vNode', vNode)

    /*
    * props
    * children
    * */
    const oldProps = oldVNode.props || EMPTY_OBJECT
    const newProps = vNode.props || EMPTY_OBJECT
    const el = (vNode.el = oldVNode.el)

    patchChildren(oldVNode, vNode, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren (oldVNode, newVNode, container, parentComponent, anchor) {

    const prevShapeFlag = oldVNode.shapeFlag
    const oldChildren = oldVNode.children
    const shapeFlag = newVNode.shapeFlag
    const newChildren = newVNode.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1.把老的清空
        unmountChildren(oldVNode.children)
      }
      if (newChildren !== oldChildren) {
        // 2.设置新的text
        hostSetElementText(container, newChildren)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(newChildren, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(oldChildren, newChildren, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren (c1, c2, container, parentComponent, parentAnchor) {
    let i = 0, l2 = c2.length, e1 = c1.length - 1, e2 = l2 - 1

    function isSomeVNodeType (oldVNode, newVNode) {
      return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const oldVNode = c1[i]
      const newVNode = c2[i]
      if (isSomeVNodeType(oldVNode, newVNode)) {
        patch(oldVNode, newVNode, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const oldVNode = c1[e1]
      const newVNode = c2[e2]
      if (isSomeVNodeType(oldVNode, newVNode)) {
        patch(oldVNode, newVNode, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的长 - 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = i + 1
        const anchor = i + 1 < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    }
  }

  function unmountChildren (children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  function patchProps (el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      // 不存在老的props，不需要进行下面的操作
      // if (!Object.keys(oldProps).length) return
      if (oldProps !== EMPTY_OBJECT) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 当children为数组时，处理子节点
  function mountChildren (children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor)
    })
  }

  function processFragment (oldVNode, vNode, container, parentComponent, anchor) {
    mountChildren(vNode.children, container, parentComponent, anchor)
  }

  function processText (oldVNode, vNode, container) {
    console.log(vNode, container)
    const { children } = vNode
    const textNode = vNode.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象
  function setupRenderEffect (instance, vNode, container, anchor) {
    /*
    * 调用的组件实例的render方法结合组件的数据将视图渲染出来
    *   因此更新的时候需要重新调用render函数渲染视图
    *   将渲染操作使用effect包裹
    * */
    effect(() => {
      if (!instance.isMounted) { // 初始化
        console.log('init')
        // instance.render 来自于 finishComponentSetup 方法，就是组件的render方法
        // 绑定this，让render中的this指向创建的代理对象
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        // vNode -> patch
        // vNode -> element -> mountElement
        patch(null, subTree, container, instance, anchor)

        // subTree指的就是class="root"的根节点
        // 子元素处理完成之后
        vNode.el = subTree.el

        instance.isMounted = true
      } else { // 更新
        console.log('update')
        const subTree = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree

        instance.subTree = subTree // 更新subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
