const html = `
  <div @click="handler">
    click me
  </div>
`

function render () {
  return h('div', { onClick: handler }, 'click me')
}

const vueTemplate = `
  <template>
    <div @click="handler">
      click me
    </div>
  </template>
  <script >
    data () {},
    methods: {
      handler () {}
    }
  </script>
`

export default {
  data () {},
  methods: {
    handler () {}
  },
  render () {
    return h('div', { onClick: handler }, 'click me')
  }
}

function renderV () {
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    },
    patchFlags: 1
  }
}






function h () {}
