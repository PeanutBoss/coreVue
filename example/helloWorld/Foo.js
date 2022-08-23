import { h } from '../../lib/guide-mini-vue-esm'

export default {
  setup(props) {
    console.log(props)
    // props 不可以被修改
  },
  render() {
    return h('div', {}, 'foo：' + this.count)
  }
}
