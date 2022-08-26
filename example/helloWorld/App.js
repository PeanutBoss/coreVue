import { h, createTextVNode } from '../../lib/guide-mini-vue-esm.js'
import { Foo } from './Foo.js'

export const App = {
    render() {
        const app = h('div', {}, 'App')
        const foo = h(Foo, {}, {
            header: ({ name }) => [h('p', {}, 'header' + name),
                createTextVNode('123')],
            footer: ({ name }) => h('p', {}, 'footer' + name)
        })
        return h('div', {}, [app, foo])
    },
    setup() {
        return {}
    }
}
