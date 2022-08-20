### 初始化component主流程

**先将整体流程写出来，具体实现细节慢慢完善**

- 创建 createApp，返回app实例

- 引入并调用 createApp，传入App组件获取到app实例，再调用它的mount方法。

- 创建 App 组件
  
  - 直接使用render函数返回虚拟节点来渲染
  
  - 创建 h 函数，h函数用来将DOM的描述信息转为虚拟DOM
  
  - setup来返回当前组件的数据

- createVNode - 将组件信息组合为一个对象（虚拟DOM）并返回

- render - 调用patch方法，方便进行后续递归处理

- patch - 去处理组件

- processComponent - 去挂载组件

- mountComponent
  
  - 需要先通过虚拟节点创建一个组件实例对象，因为组件包含自己的一些属性，比如props、slots
  
  - setupComponent - 处理setup中的信息、初始化props、初始化slots
    
    - handleSetupResult - 将setup中的数据添加到实例上
    
    - finishComponentSetup - 将组件对象上的render添加到实例对象上
  
  - setupRenderEffect - 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象

#### 文件结构

src -> runtime-core

- component.ts
  
  ```typescript
  export function createComponentInstance (vNode) {
    const component = {
      vNode,
      type: vNode.type,
      setupState: {}
    }
    return component
  }
  
  export function setupComponent (instance) {
    // TODO
    // initProps
    // initSlots
  
    // 处理setup，将其添加到组件实例上
    setupStatefulComponent(instance)
  }
  
  function setupStatefulComponent(instance) {
    // 第一次patch的时候instance.type就是传入的App组件
    const Component = instance.type
  
    const { setup } = Component
  
    if (setup) {
      const setupResult = setup()
  
      handleSetupResult(instance, setupResult)
    }
  }
  
  function handleSetupResult (instance, setupResult) {
    // TODO
    if (typeof setupResult === 'object') {
      instance.setupState = setupResult
    }
    finishComponentSetup(instance)
  }
  
  function finishComponentSetup (instance) {
    const Component = instance.type
    if (Component.render) {
      instance.render = Component.render
    }
  
  }
  ```

- createApp.ts
  
  ```typescript
  import {createVNode} from "./vNode";
  import {render} from "./renderer";
  
  export function createApp (rootComponent) {
    return {
      // 接收一个element实例作为根容器，整体入口
      mount (rootContainer) {
        // 先转vNode  component -> vNode
        // 所有逻辑操作都会基于vNode做处理
        const vNode = createVNode(rootComponent)
        render(vNode, rootContainer)
      }
    }
  }
  
  ```

- h.ts
  
  ```typescript
  import { createVNode } from './vNode'
  export function h (type, props?, children?) {
    return createVNode(type, props, children)
  }
  ```

- index.ts
  
  ```typescript
  export { createApp } from './createApp'
  export { h } from './h'
  ```

- renderer.ts
  
  ```typescript
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
    // 第一次渲染App组件的时候会执行
    setupRenderEffect(instance, vNode, container)
  }
  
  function processElement (vNode, container) {
    mountElement(vNode, container)
  }
  
  function mountElement(vNode, container) {
    const el = document.createElement(vNode.type)
    // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
    if (typeof vNode.children === 'string') {
      el.textContent = vNode.children
    }
    // 将DOM添加到对应容器中
    container.appendChild(el)
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
  
  ```

- vNode.ts
  
  ```typescript
  export function createVNode (type, props?, children?) {
    const vNode = {
      type,
      props,
      children,
      el: null
    }
    return vNode
  }
  ```

#### 初始化流程分析 - 可以打断点查看

- 创建根容器 - const rootContainer = document.querySelector('#app')

- 调用createApp并传入App组件，最后调用mount将app实例挂载到容器中 - createApp(App).mount(rootContainer)

- 调用mount方法，实际就是整个系统的入口

- 根据传入的App创建对应的虚拟DOM，调用render方法（传入虚拟DOM和跟容器）

- 调用patch打补丁（或者叫挂载） - patch(vNode, container)

- 判断虚拟DOM type 属性的类型（虚拟DOM的组成在createVNode中查看），如果是 string，那么它是一个普通HTML元素；否则它就是一个组件，调用processComponent 来处理组件 - processComponent(vNode, container)

- 调用mountComponent(vNode, container)

- 根据虚拟DOM创建组件实例 - createComponentInstance(vNode)

- 调用setupComponent处理setup中的信息 - setupComponent(instance)

- 调用setupStatefulComponent，调用组件对象的setup方法拿到返回值

- 将返回值赋值给组件实例的setupState属性

- 调用finishComponentSetup，将组件的render方法添加到组件实例上

- 调用setupRenderEffect，他会调用组件实例的render方法返回组件对应的虚拟DOM，然后调用patch方法处理App组件的子元素

- 后面就是处理element类型的元素，目前只关注component类型


