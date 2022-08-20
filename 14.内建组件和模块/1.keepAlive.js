/* KeepAlive - 组件的激活与失活 */

/*
* KeepAlive的本质是缓存管理，再加上特殊的卸载/挂载逻辑
*   被KeepAlive缓存的数据实际上从原容器被搬到另一个隐藏容器中
*   KeepAlive组件可以避免一个组件被频繁地销毁/重建
* */

const KeepAlive = {
  // KeepAlive 组件独有的属性，用作标识
  __isKeepAlive: true,
  setup (props, { slots }) {
    // 创建一个缓存对象：key - vNode.type; value - vNode
    const cache = new Map()
    // 当前KeepAlive组件的实例
    const instance = currentInstance
    // 对于KeepAlive组件来说，它的实例上存在特殊的keepAliveCtx对象，该对象由渲染器注入
    // 该对象会暴露渲染器的一些内部方法，其中move函数用来将一段Dom移动到另一个容器中
    const { move, createElement } = instance.keepAliveCtx
    // 创建隐藏容器
    const storageContainer = createElement('div')

    // KeepAlive 组件的实例上会被添加两个内部函数，分别是 _deActivate 和 _activate
    // 失活时调用的方法
    instance._deActivate = vNode => {
      move(vNode, storageContainer)
    }
    // 激活时调用的方法
    instance.activate = (vNode, container, anchor) => {
      move(vNode, container, anchor)
    }

    return () => {
      // KeepAlive 的默认插槽就是要被KeepAlive的组件
      let rawVNode = slots.default()
      // 如果不是组件，直接渲染即可，因为非组件的虚拟节点无法被KeepAlive
      if (typeof rawVNode.type !== 'object') {
        return rawVNode
      }

      // 在挂载时先获取缓存的组件 vNode
      const cacheVNode = cache.get(rawVNode.type)
      if (cacheVNode) {
        // 如果由缓存的内容，则说明不应该执行挂载，而应该执行激活
        // 继承组件实例
        rawVNode.component = cacheVNode.component
        // 在 vNode 上添加keptAlive属性，标记为true，避免渲染器重新挂载它
        rawVNode.keptAlive = true
      } else {
        // 如果没有缓存，则将其添加到缓存中，这样下次激活组件时就不会执行新的挂载动作
        cache.set(rawVNode.type, rawVNode)
      }

      // 在组件 vNode 上添加shouldKeepAlive 属性，并标记为true，避免渲染器真的将组件卸载
      rawVNode.shouldKeepAlive = true
      // 将 KeepAlive 组件的实例也添加到 vNode 上，以便在渲染器中访问
      rawVNode.keepAliveInstance = instance
      // 渲染组件vNode
      return rawVNode
    }
  }
}

/*
* KeepAlive组件本身不会渲染额外的内容，它的渲染函数最终只返回需要被KeepAlive的组件，我们把这个需要被KeepAlive
*   的组件称为内部组件
* */
