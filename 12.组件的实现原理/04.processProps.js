/* 处理props */

const template = `
  <MyComponent title="A Big Title"></MyComponent>
`
// 模板对应的虚拟DOM
const vNode = {
  type: MyComponent,
  props: {
    title: 'A Big Title',
    other: this.val
  }
}
// 组件内指定需要接收的数据
const MyComponent = {
  name: 'MyComponent',
  props: {
    title: String
  },
  render () {
    return {
      type: 'div',
      children: `count is ${this.title}` // 访问props数据
    }
  }
}

/*
* 对一个组件来说，有两部分props的内容需要关心
*   为组件传递的props数据 - 使用组件时传入的
*   组件选项对象中定义的props选项 - 组件生命接收的
* */

function mountComponent (vNode, container, anchor) {
  const componentOptions = vNode.type
  const { render, data, props: propsOptions /* 省略其他 */ } = componentOptions
  const state = reactive(data())
  const [props, attrs] = resolveProps(propsOptions, vNode.props)

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null
  }
  vNode.compinent = instance
  // 省略部分代码
}

function resolveProps (options, propsData) {
  const props = {}
  const attrs = {}
  for (const key in propsData) {
    if (key in options) {
      // 如果为组件传递的props数据在组件自身的props选项中有定义，则添加到props中
      props[key] = propsData[key]
    } else {
      // 否则添加到attrs中
      attrs[key] = propsData[key]
    }
  }
  // 最后返回 props 与 attrs 数据
  return [props, attrs]
}
