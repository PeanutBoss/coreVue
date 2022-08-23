import { h } from '../../lib/guide-mini-vue-esm.js'
// import Foo from './Foo'

// const templateSetupResult = h('div', {}, 'hello,' + this.msg)
// const templateArrayChildren = h('div', { class: 'root' }, [
//     h('p', { class: 'red' }, this.msg),
//     h('p', { class: 'green' }, 'mini-vue')
// ])

const Foo = {
  setup(props) {
    props.count++ // 不能修改,因为props是只读的
    console.log(props)
    // props 不可以被修改
  },
  render() {
    return h('div', {}, 'foo：' + this.count)
  }
}

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
                // h('p', { class: 'red' }, this.msg),
                // h('p', { class: 'green' }, 'mini-vue')
              h('div', {}, 'hi, ' + this.msg),
              h(Foo, { count: 1 })
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
