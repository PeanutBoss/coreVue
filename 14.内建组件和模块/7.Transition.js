const TransitionExample = {
  name: 'Transition',
  setup (props, { slots }) {
    return () => {
      // 通过默认插槽获取需要过渡的元素
      const innerVNode = slots.default()

      // 再过渡元素的VNode对象上添加 transition 响应的钩子函数
      innerVNode.transition = {
        beforeEnter (el) {
          // 省略部分代码
        },
        enter (el) {
          // 省略部分代码
        },
        leave (el, performRemove) {
          // 省略部分代码
        }
      }
      // 渲染需要过渡的元素
      return innerVNode
    }
  }
}

/*
* Transition组件不会渲染任何额外的内容，它知识通过默认插槽读取过渡元素，并渲染需要过渡的元素
* Transition组件的作用，就是再过渡元素的虚拟节点上添加transition相关的钩子函数
* */
function mountElement (vNode, container, anchor) {
  const el = vNode.el.createElement(vNode.type)

  if (typeof  vNode.children === 'string') {
    setElementText(el, vNode.children)
  } else if (Array.isArray(vNode.children)) {
    vNode.children.forEach(child => {
      patch(null, child, el)
    })
  }

  if (vNode.props) {
    for (const key in vNode.props) {
      patchProps(el, key, null, vNode.props[key])
    }
  }

  // 判断vNode是否需要过渡
  const needTransition = vNode.transition
  if (needTransition) {
    // 调用 transition.beforeEnter 钩子，并将DOM元素作为参数传递
    vNode.transition.beforeEnter(el)
  }

  // 挂载元素
  insert(el, container, anchor)

  if (needTransition) {
    // 调用 transition.enter 钩子，并将DOM元素作为参数传递
    vNode.transition.enter(el)
  }
}

function unmount (vNode) {
  const needTransition = vNode.transition
  if (vNode.type === Fragment) {
    vNode.children.forEach(c => unmount(c))
    return
  } else if (typeof vNode.type === 'object') {
    if (vNode.shouldKeepAlive) {
      vNode.keepAliveInstance._deActivate()
    } else {
      unmount(vNode.component.subTree)
    }
    return
  }

  const parent = vNode.el.parentNode
  if (parent) {
    // 将卸载动作封装套 performRemove 函数中
    const performRemove = () => parent.removeChild(vNode.el)
    if (needTransition) {
      // 如果需要过渡处理，则调用 transition.leave 钩子
      // 同时将DOM元素和 performRemove 作为参数传递
      vNode.transition.leave(vNode.el, performRemove)
    } else {
      // 如果不需要过渡，直接执行卸载操作
      performRemove()
    }
  }
}

const Transition = {
  name: 'Transition',
  setup (props, { slots }) {
    return () => {
      const innerVNode = slots.default()

      innerVNode.transition = {
        beforeEnter(el) {
          el.classList.add('enter-from')
          el.classList.add('enter-active')
        },
        enter(el) {
          // 在下一帧切换到结束状态
          nextFrame(() => {
            el.classList.remove('enter-from')
            el.classList.add('enter-to')
            // 监听过渡结束完成收尾
            el.addEventListener('transitionend', () => {
              el.classList.remove('enter-to')
              el.classList.remove('enter-active')
            })
          })
        },
        leave(el, performRemove) {
          // 设置立场过渡的初始状态
          el.classList.add('leave-from')
          el.classList.add('leave-active')
          // 强制reflow，是的初始状态生效
          document.body.offsetHeight
          nextFramg(() => {
            // 移除leave-from、添加leave-to
            el.classList.remove('leave-from')
            el.classList.add('leave-to')

            // 监听 transition 事件完成收尾工作
            el.addEventListener('transitionend', () => {
              el.classList.remove('leave-to')
              el.classList.remove('leave-active')

              // 调用 transition.leave 的第二个参数，完成DOM元素的卸载
              performRemove()
            })
          })
        }
      }
    }
  }
}

function nextFramg (fn) {}
