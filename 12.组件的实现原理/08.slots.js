/* 插槽的实现与工作原理 */

/*
* 稍微有点绕 - 写出流程
* 子组件定义插槽 --> 编译为虚拟节点（或函数返回虚拟节点） --> 父组件使用时为插槽写入内容 --> 将父组件编译为对应虚拟DOM
* --> 父组件会将写入插槽的内容放入children中 --> 挂载组件时将children中对应的插槽内容加入组件中
* --> 通过调用this.$slots.name()返回对应虚拟节点
* */

// 对应槽位要渲染的内容由用户插入 - 子组件定义插槽
const MyComponent = `
<template>
  <div>
    <slot name="header"></slot>
  </div>
  <div>
    <slot name="body"></slot>
  </div>
  <div>
    <slot name="footer"></slot>
  </div>
</template>
`

// 组件模板中的插槽内容会被编译为插槽函数，而插槽函数的返回值就是具体的插槽内容
// 组件MyComponent的模板被编译为渲染函数 - 编译为虚拟节点
function renderMyComponent () {
  return [
    {
      type: 'header',
      children: [this.$slots.header()]
    },
    {
      type: 'body',
      children: [this.$slots.body()]
    },
    {
      type: 'footer',
      children: [this.$slots.footer()]
    }
  ]
}

// 在父组件使用MyComponent组件时，可以根据槽位的名字来插入自定义内容 - 父组件使用时为插槽写入内容
const template = `
<MyComponent>
  <template #header>
    <h1>我是标题</h1>
  </template>
  <template #body>
    <section>我是内容</section>
  </template>
  <template #footer>
    <p>我是注脚</p>
  </template>
</MyComponent>
`

// 这段父组件模板会被编译成对应的渲染函数 - 将父组件编译为对应虚拟DOM
function renderParent () {
  return {
    type: MyComponent,
    children: {
      header () {
        return { type: 'h1', children: '我是标题' }
      },
      body () {
        return { type: 'section', children: '我是内容' }
      },
      footer () {
        return { type: 'p', children: '我是注脚' }
      },
    }
  }
}

// 渲染插槽内容的过程，就是调用插槽函数并渲染由其返回的内容的过程
function mountComponent (vNode, container, anchor) {
  // 省略

  // 直接使用编译好的vNode.children对象作为 slots 对象即可
  const slots = vNode.children || {}
  // 将 slots 对象添加到seetupContext中
  const setupContext = { attrs, emit, slots }

  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
    // 将插槽添加到组件实例上
    slots
  }

  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props, slots } = t
      if (k === '$slots') return slots
      // 省略
    },
    set(t, k, v, r) {
      // 省略
    }
  })

  // 省略
}

// 将编译好的vNode.children作为slots对象
