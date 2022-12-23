import { h, renderSlots, createTextVNode, getCurrentInstance } from '../../lib/guide-mini-vue-esm.js'

const SlotComp = {
  name: 'Slot',
  setup () {
    console.log(getCurrentInstance())
  },
  render() {
    const age = 22
    const foo = h('div', {}, 'slotComp')
    // return h('div', {}, [foo, h('div', {}, this.$slots)])
    // return h('div', {}, [foo, renderSlots(this.$slots)])
    // 3.具名插槽
    // return h('div', {}, [renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'footer')])
    // 4.作用域插槽
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { age }),
      foo,
      renderSlots(this.$slots, 'footer')
    ])
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
      [
        h('div', {}, 'hello, ' + this.msg),
        h(
          SlotComp,
          {},
            // h('p', {}, '123')
            // [h('p', {}, '123'), h('p', {}, '456')]
            // 3.具名插槽
          // {
          //   header: h('p', {}, 'header'),
          //   footer: h('p', {}, 'footer')
          // }
          // 4.作用域插槽
          {
            header: ({ age }) =>  [h('p', {}, 'header' + age), createTextVNode('这是一段文本')],
            footer: () => h('p', {}, 'footer')
          }
        )
      ]
    )
  },
  setup () {
    console.log(getCurrentInstance())
    return {
      msg: 'mini-vue'
    }
  }
}
