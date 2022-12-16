import { h } from '../../lib/guide-mini-vue-esm.js'
export default {
  render () {
    return h(
      'p',
      { id: 'root' },
      'hello, ' + this.msg
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
