/* 将组件渲染为HTML字符串 */

/*
* 组将渲染为HTML字符串与把普通标签节点渲染为HTML字符串并没有本质区别。
* 组件的渲染函数用来描述组件要渲染的内容，它的返回值是虚拟DOM。
* */

function renderComponentVNodeV1 (vNode) {
  // 获取 setup 组件选项
  let { type: { setup } } = vNode
  // 执行 setup 函数得到的渲染函数 render
  const render = setup()
  // 执行渲染函数得到 subTree，即组件要渲染的内容
  const subTree = render()
  // 调用 renderElementVNode 完成渲染，并返回其结果
  return renderComponentVNode(subTree)
}

function renderVNode (vNode) {
  const type = typeof vNode.type
  if (type === 'string') {
    return renderElementVnode(vNode)
  } else if (type === 'object' || type === 'function') {
    return  renderComponentVNode(vNode)
  } else if (vNode.type === Fragment) {
    // 处理片段
  } else {
    // 其他vNode类型
  }
}

function renderComponentVNodeV2 (vNode) {
  // 获取 setup 组件选项
  let { type: { setup } } = vNode
  // 执行 setup 函数得到的渲染函数 render
  const render = setup()
  // 执行渲染函数得到 subTree，即组件要渲染的内容
  const subTree = render()
  return renderVNode(subTree)
}


function renderComponentVNode (vNode) {
  const isFunctional = typeof vNode.type === 'function'
}
