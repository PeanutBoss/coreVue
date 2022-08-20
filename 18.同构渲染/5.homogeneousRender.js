/* 编写同构渲染的代码 */

/*
* ClientOnly 原理
* */

import { ref, onMounted, defineComponent } from 'vue'

export const ClientOnly = defineComponent({
  setup (_, { slots }) {
    // 标记变量，仅在客户端执行
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })
    // 在服务端什么都不熏染，在客户端才渲染它的插槽内容
    return () => (show.value && slots.default ? slots.default() : null)
  }
})
