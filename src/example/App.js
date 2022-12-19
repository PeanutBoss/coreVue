import { h } from '../../lib/guide-mini-vue-esm.js'

const Child = {
  setup (props, { emit }) {
    // props.count++
    const emitAdd = (e) => {
      e.stopPropagation()
      emit('add', 'a', 'b', 'c')
    }
    const emitChange = (e) => {
      e.stopPropagation()
      emit('change', 1, 2, 3)
    }
    return {
      emitAdd,
      emitChange
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'add')
    const change = h('button', {
      onClick: this.emitChange
    }, 'change')
    const foo = h('div', {}, 'count = ' + this.count)
    return h('div', {}, [foo, btn, change])
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
        h(Child, {
          count: 10,
          onChange (a, b, c) {
            console.log('触发change事件', a, b, c)
          },
          onAdd (a, b, c) {
            console.log('onAdd触发', a, b, c)
          }
        })
      ]
      // [
      //   h('p', { class: 'aquamarine' }, 'hi'),
      //   h('p', { class: 'aqua' }, 'mini-vue')
      // ]
    )
  },
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
