import { h } from '../../lib/guide-mini-vue-esm.js'

export const App = {
  render () {
    // return h('div',{}, 'hello,' + this.msg)
    return h('div',{ class: 'root' }, [
      h('p', { class: 'red' }, this.msg),
      h('p', { class: 'green' }, 'mini-vue')
    ])
  },
  setup () {
    // composition api
    return {
      msg: 'mini-vue'
    }
  }
}
