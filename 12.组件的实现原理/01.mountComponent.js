/* 渲染组件 */

/*
* 从渲染器内部实现来看，一个组件就是一个特殊类型的虚拟DOM节点
* 渲染器会使用虚拟节点的type属性来区分其类型。对于不同节点，采用不同处理方法完成
*   挂载和更新
* */

function patch (n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }

  const { type } = n2

  if (typeof type === 'string') {
    // 作为普通元素处理
  } else if (type === Text) {
    // 作为文本节点处理
  } else if (type === Fragment) {
    // 作为片段处理
  } else if (typeof type === 'object') {
    // vNode.type 的值时选项对象，作为组件处理
    if (!n1) {
      // 挂载组件
      mountComponent(n2, container, anchor)
    } else {
      // 更新组件
      patchComponent(n1, n2, anchor)
    }
  }
}

/*
* 设计组件在用户层面的接口
* 组件的渲染函数就是用来描述组件所渲染内容的接口
* 渲染器中真正完成组件渲染任务的是 mountComponent 函数
* */

// 描述组件的VNode对象
const CompVNode = {
  type: MyComponent
}
renderer.render(CompVNode, document.querySelector('#app'))

function mountComponent (vNode, container, anchor) {
  // 通过vNode获取组件的选项对象，即vNode.type
  const componentOptions = vNode.type
  // 获取组件的渲染函数 render
  const { render } = componentOptions
  // 执行渲染函数，获取组件要渲染的内容，即 render 函数返回的虚拟DOM
  const subTree = render()
  // 最后调用 patch 函数来话再组件所描述的内容，即subTree
  patch(null, subTree, container, anchor)
}

