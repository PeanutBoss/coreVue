import { h, provider, inject } from '../../lib/guide-mini-vue-esm.js'

const Provider = {
    name: 'Provider',
    setup () {
        provider('foo', 'FooVal'),
            provider('bar', 'BarVal')
    },
    render () {
        return h('div', {}, [h('p', {}, 'provider'), h(ProviderTwo)])
    }
}

const ProviderTwo= {
    name: 'Provider',
    setup () {
        provider('foo', 'FooTwoVal')
        const foo = inject('foo')
        return {
            foo
        }
    },
    render () {
        return h('div', {}, [h('p', {}, `providerTwo foo: ${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: 'Consumer',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        // const baz = inject('baz', 'defaultBaz')
        const baz = inject('baz', () => 'defaultBaz')
        return {
            foo,
            bar,
            baz
        }
    },
    render () {
        return h('div', {}, `Consumer - ${this.foo} - ${this.bar} - ${this.baz}`)
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
