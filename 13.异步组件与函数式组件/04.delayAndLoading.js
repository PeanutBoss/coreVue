/* 延迟和Loading组件 */

function defineAsyncComponentV2 (options) {
  if (typeof options === 'function') {
    options = {
      loader: options
    }
  }

  const { loader } = options
  let InnerComp = null

  return {
    name: 'AsyncComponentWrapper',
    setup () {
      const loaded = ref(false)
      const error = shallowRef(null)
      const timeout = ref(false)
      // 标志，是否正在加载
      const loading = ref(false)
      let loadingTimer = null

      // 存在延迟则开启一个定时器，延迟结束后将 loading.value 设置为true
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay)
      } else {
        // 如果没有，则直接标记加载中
        loading.value = true
      }

      loader()
        .then(c => {
          InnerComp = c
          loaded.value = true
        })
        .catch(err => error.value = err)
        .finally(() => {
          loading.value = false
          // 加载完毕后，清除定时器
          clearTimeout(loadingTimer)
        })

      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout}ms`)
          timeout.value = true
          error.value = err
        }, options.timeout)
      }

      onUnmounted(() => clearTimeout(timer))

      // 占位内容
      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return options.errorComponent ? { type: options.errorComponent, props: error.value } : placeholder
        } else if (loading.value && options.loadingComponent) {
          // 如果异步组件正在加载，且制定了loading组件，则渲染loading组件
          return { type: options.loadingComponent }
        }
        return placeholder
      }
    }
  }
}

// 支持异步组件中Loading组件的卸载
function unmount (vNode) {
  if (vNode.type === Fragment) {
  } else if (typeof vNode.type === 'object') {
    // 对于组件的卸载，本质上时卸载组件要渲染的所有内容，即subTree
    unmount(vNode.component.subTree)
    return
  }
  const parent = vNode.el.parentNode
  if (parent) {
    parent.removeChild(vNode.el)
  }
}
