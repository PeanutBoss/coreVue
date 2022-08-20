/* 超时与Error组件 */

/* base */
function defineAsyncComponentV1 (options) {
  // options 可以是配置项，也可以是加载器
  if (typeof options === 'function') {
    // 如果options是加载器，将其格式化为配置项形式
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
      // 是否超时
      const timeout = ref(false)

      loader().then(c => {
        InnerComp = c
        loaded.value = true
      })

      let timer = null
      if (options.timeout) {
        // 如果制定了超时时长，则开启一个定时器计时
        timer = setTimeout(() => {
          // 超时后将timeout设资为true
          timeout.value = true
        }, options.timeout)
      }

      // 包装组件被卸载时清除定时器
      onUnmounted(() => clearTimeout(timer))

      // 占位内容
      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          // 如果组件异步加载成功，则渲染被加载的组件
          return { type: InnerComp }
        } else if (timeout.value) {
          // 如果加载超时且制定了Error组件，则渲染该组件
          return options.errorComponent ? { type: options.errorComponent } : placeholder
        }
        return placeholder
      }
    }
  }
}

/* processError */
function defineAsyncComponentV2 (options) {
  // options 可以是配置项，也可以是加载器
  if (typeof options === 'function') {
    // 如果options是加载器，将其格式化为配置项形式
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
      // 定义error，当错误发生时，用来存储错误对象
      const error = shallowRef(null)
      // 是否超时
      const timeout = ref(false)

      loader()
        .then(c => {
          InnerComp = c
          loaded.value = true
        })
        // 添加catch语句捕获加载过程中的错误
        .catch(err => error.value = err)

      let timer = null
      if (options.timeout) {
        // 如果制定了超时时长，则开启一个定时器计时
        timer = setTimeout(() => {
          // 创建一个错误对象，并赋值给error.value
          const err = new Error(`Async component timed out after ${options.timeout}ms`)
          // 超时后将timeout设资为true
          timeout.value = true
          error.value = err
        }, options.timeout)
      }

      // 包装组件被卸载时清除定时器
      onUnmounted(() => clearTimeout(timer))

      // 占位内容
      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          // 如果组件异步加载成功，则渲染被加载的组件
          return { type: InnerComp }
          // 只有当错误存在且配置了错误组件时才展示Error组件
        } else if (error.value && options.errorComponent) {
          // 如果加载超时且制定了Error组件，则渲染该组件
          return options.errorComponent ? { type: options.errorComponent, props: error.value } : placeholder
        }
        return placeholder
      }
    }
  }
}

