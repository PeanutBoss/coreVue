import { h } from '../../lib/guide-mini-vue-esm.js'
import { Foo } from './Foo.js'

export const App = {
    render() {
        // fragment 作为 Foo组件的默认插槽内容
        const fragment1 = h('p', {}, '123')
        const fragment2 = h('p', {}, '456')
        const app = h('div', {}, 'App')
        // const foo = h(Foo, {}, fragment1) // 正常
        const foo = h(Foo, {}, [fragment1, fragment2])
        // const foo = h(Foo, {}, {
        //     header: h('p', {}, 'header'),
        //     footer: h('p', {}, 'footer'),
        // })
        // const foo = h(Foo, {}, h('div', {}, [fragment1, fragment2]))
        return h('div', {}, [app, foo])
    },
    setup() {
        return {}
    }
}
