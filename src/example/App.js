export default {
  render () {
    return h('p', 'hello, ' + this.msg)
  },
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
