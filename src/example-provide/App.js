import { h, provide, inject } from '../../lib/guide-mini-vue-esm.js'

const Provider = {
  name: "Provider",
  setup () {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render () {
    // return h('div', {}, [h('p', {}, 'provider'), h(Consumer)])
    return h('div', {}, [h('p', {}, 'provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: "Provider",
  setup () {
    provide('foo', 'fooValTwo')
    const foo = inject('foo')
    return {
      foo
    }
  },
  render () {
    return h('div', {}, [h('p', {}, `providerTwo - ${this.foo}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup () {
    const foo = inject('foo')
    const bar = inject('bar')
    return {
      foo,
      bar
    }
  },
  render () {
    return h('div', {}, `consumer - ${this.foo} - ${this.bar}`)
  }
}

export default {
  name: 'App',
  render () {
    window.self = this
    return h(
      'p',
      {
        id: 'root',
        onClick: () => {
          console.log('click')
        }
      },
      [h(Provider, {}, '')]
    )
  },
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
