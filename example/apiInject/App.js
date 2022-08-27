import { h, provider, inject } from '../../lib/guide-mini-vue-esm.js'

const Provider = {
    name: 'Provider',
    setup () {
        provider('foo', 'FooVal'),
        provider('bar', 'BarVal')
    },
    render () {
        return h('div', {}, [h('p', {}, 'provider'), h(Consumer)])
    }
}

const Consumer = {
    name: 'Consumer',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        return {
            foo,
            bar
        }
    },
    render () {
        return h('div', {}, `Consumer - ${this.foo} - ${this.bar}`)
    }
}

export default {
    name: 'App',
    setup () {
    },
    render () {
        return h('div', {}, [h('p', {}, 'apiInject'), h(Provider, {})])
    }
}
