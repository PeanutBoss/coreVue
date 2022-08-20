/* include 和 exclude */

const KeepAliveExample = {
  __isKeepAlive: true,
  // 定义 include 和 exclude（简化：只允许设置正则类型的值）
  props: {
    include: RegExp,
    exclude: RegExp
  },
  setup (props, { slots }) {}
}

const cache = new Map()
const KeepAlive = {
  __isKeepAlive: true,
  // 定义 include 和 exclude（简化：只允许设置正则类型的值）
  props: {
    include: RegExp,
    exclude: RegExp
  },
  setup (props, { slots }) {
    // 省略

    return () => {
      let rawVNode = slots.default()
      if (typeof rawVNode.type !== 'object') {
        return rawVNode
      }
      // 获取 内部组件 的vNode
      const name = rawVNode.type.name
      // 对 name 进行匹配
      if (
        name &&
        // 如果name无法被include匹配
        (props.include && !props.include.test(name)) &&
        // 或者被exclude匹配
        (props.exclude && props.exclude.test(name))
      ) {
        // 直接渲染 内部组件，不会器进行后续的缓存操作
        return rawVNode
      }
    }
  }
}
