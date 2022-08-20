/* 封装 defineAsyncComponent 函数 */

/*
* defineAsyncComponent 函数本质上就是一个告诫组件，它的返回值是一个包装组件
* */

function defineAsyncComponent (loader) {
  let InnerComp = null
  return {
    name: 'AsyncComponentWrapper',
    setup () {
      // 是否加载成功
      const loaded = ref(false)
      // 执行加载器函数，返回一个Promise实例，加载成功后，将加载成功的组件赋值给InnerComp，
      //  并将loaded标记为true，代表加载成功
      loader().then(c => {
        InnerComp = c
        loaded.value = true
      })
      return () => {
        return loaded.value ? { type: InnerComp } : { type: Text,children: '' }
      }
    }
  }
}
