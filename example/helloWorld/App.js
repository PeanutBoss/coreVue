import { h } from '../../lib/guide-mini-vue-esm.js'
import { Foo } from './Foo.js'

export const App = {
    render() {
        // return h('div',{}, 'hello,' + this.msg)
        return h(
            'div', {
                class: 'root',
                onClick() {
                    console.log('click')
                },
                onMousedown() {
                    console.log('mousedown')
                }
            }, [
                h('div', {}, 'hi, ' + this.msg),
                h(
                    Foo, {
                        count: 1,
                        onAdd(a, b) {
                            console.log('emit触发')
                            console.log(a, b)
                        },
                        // add-foo
                        onAddFoo() {
                            console.log('烤肉串');
                        }
                    }
                )
            ]
        )
    },
    setup() {
        // composition api
        return {
            msg: 'mini-vue'
        }
    }
}
