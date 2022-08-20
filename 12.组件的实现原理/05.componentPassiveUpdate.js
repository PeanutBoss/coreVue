/* 组件的被动更新 */

const template = `
  <MyComponent title="A Big Title"></MyComponent>
`
// 渲染的旧内容
const vNode = {
  type: MyComponent,
  props: {
    title: 'A Big Title',
    other: this.val
  }
}
// 渲染的新内容
const newVNode = {
  type: MyComponent,
  props: {
    title: 'A Small Title',
    other: this.val
  }
}

function patch (n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  const { type } = n2
  if (typeof type === 'string') {
  } else if (type === Text) {
  } else if (type === Fragment) {
  } else if (typeof type === 'object') {
    //
    if (!n1) {
      mountComponent(n2, container, anchor)
    } else {
      // 父组件传入的 title 发生变化，会触发子组件更新
      patchComponent(n1, n2, anchor)
    }
  }
}
/*
* 父组件中数据发生变化会自动更新，因为父组件subTree包含组件类型的虚拟节点（MyComponent），所以会
*   调用patchComponent函数完成子组件更新；将由父组件更新引起的子组件更新叫做子组件的被动更新。
* 当发生子组件被动更新时，需要检查子组件时许真的需要更新，因为子组件的props可能不变；
*   如果需要更新，则更新子组件的props、slots等内容
* */

// 对组件打补丁
function patchComponent (n1, n2, anchor) {
  // 获取组件实例，即n1.component，同时让新的组件虚拟节点n2.component也指向组件实例
  const instance = (n2.component = n1.component)
  // 获取当前的props数据
  const { props } = instance
  // 调用 hasPropsChange 检测为子组件传递的 props 是否发生变化，如果没有变化，则不需要更新
  if (hasPropsChange(n1.props, n2.props)) {
    // 调用 resolveProps 函数重新获取props数据
    const [nextProps] = resolveProps(n2.type.props, n2.props)
    // 更新props
    for (const key in nextProps) {
      props[key] = nextProps[key]
    }
    // 删除不存在的 props
    for (const key in props) {
      if (!(key in nextProps)) delete props[key]
    }
  }
}

// 检查props是否有变化
function hasPropsChange (preProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  // 如果新旧props的数量发生变化，说明由变化
  if (nextKeys.length !== Object.keys(preProps).length) {
    return true
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    // 有不相等的props，说明有变化
    if (nextProps[key] !== preProps) return true
  }
  return false
}

// 代理 state、props
function mountComponent (vNode, container, anchor) {
  // 省略

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null
  }
  vNode.component = instance
  // 创建渲染上下文对象，本质上时组件实例的代理
  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      // 取得组件自身的状态与props数据
      const { state, props } = t
      if (state && k in state) {
        // 尝试从状体中读取
        return state[k]
      } else if (k in props) {
        // 组件状态中没有，则从props中读取
        return props[k]
      } else {
        console.log('不存在')
      }
    },
    set(t, k, v, r) {
      const { state, props } = t
      if (state && k in state) {
        state[k] = v
      } else if (k in props) {
        console.warn(`props are readonly`)
      } else {
        console.log('不存在')
      }
    }
  })
  // 生命周期函数调用时需要绑定渲染上下文对象
  created && created.call(renderContext)

  // 省略
}
