import { h, renderSlots } from '../../lib/guide-mini-vue-esm.js'

export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h('p', {}, 'foo')
        console.log(renderSlots(this.$slots))
        // 获取渲染的元素
        // 获取元素需要渲染的位置
        return h('div', {}, [foo, renderSlots(this.$slots)])
    }
}
