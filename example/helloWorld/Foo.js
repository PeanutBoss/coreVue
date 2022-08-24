import { h } from '../../lib/guide-mini-vue-esm.js'

export const Foo = {
    setup(props, { emit }) {
        props.count++ // 不能修改,因为props是只读的
            console.log(props)

        const emitAdd = () => {
            console.log('emit add');
            emit('add', 2, 5)
        }
        const emitAddFoo = () => {
            emit('add-foo')
        }
        return {
            emitAdd,
            emitAddFoo
        }
    },
    render() {
        const btn = h(
            'button', {
                // onClick: this.emitAddFoo
                onClick: this.emitAdd
            },
            'emitAdd'
        )
        const foo = h('div', {}, 'foo：' + this.count)
        return h('div', {}, [foo, btn])
    }
}