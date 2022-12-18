import { h } from '../../lib/guide-mini-vue-esm.js'

const Child = {
  setup (props) {
    // props.count++
    const emitAdd = (e) => {
      e.stopPropagation()
      console.log('emit add')
      emit('add')
    }
    return {
      emitAdd
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'add')
    const foo = h('div', {}, 'count = ' + this.count)
    return h('div', {}, [foo, btn])

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
          onAdd () {
            console.log('onAdd触发')
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
