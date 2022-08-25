import { h, renderSlots } from '../../lib/guide-mini-vue-esm.js'

export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h('p', {}, 'foo')
        // 获取渲染的元素
        // 获取元素需要渲染的位置
        return h('div', {}, [
            renderSlots(this.$slots, 'header', { name: '路飞' }),
            foo,
            renderSlots(this.$slots, 'footer', { name: '乔巴' })
        ])
    }
}
