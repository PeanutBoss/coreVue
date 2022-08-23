import { h } from '../../lib/guide-mini-vue-esm.js'

// const templateSetupResult = h('div', {}, 'hello,' + this.msg)
// const templateArrayChildren = h('div', { class: 'root' }, [
//     h('p', { class: 'red' }, this.msg),
//     h('p', { class: 'green' }, 'mini-vue')
// ])

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
                h('p', { class: 'red' }, this.msg),
                h('p', { class: 'green' }, 'mini-vue')
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