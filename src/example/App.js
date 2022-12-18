import { h } from '../../lib/guide-mini-vue-esm.js'

const Child = {
  setup (props) {
    props.count++
  },
  render() {
    return h('div', {}, 'count = ' + this.count)
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
        h(Child, { count: 10 })
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
