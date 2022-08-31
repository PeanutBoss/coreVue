import { ref, h } from '../../lib/guide-mini-vue-esm.js'

// const nextChildren = [h('div', {}, 'C'), h('div', {}, 'D')]
// const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]

/*
* 1.左侧的对比
* (a b) c
* (a b) d e
* */
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E')
// ]

/*
* 2.右侧的对比
* a (b c)
* d e (b c)
* */
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]

/*
* 3-1.新的比老的长 - 创建新的 - 左侧
* (a b)
* (a b) c
* */
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]

/*
* 3-2.新的比老的长 - 创建新的 - 右侧
* (a b)
* (a b) c
* */
const prevChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B')
]
const nextChildren = [
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B')
]

export default {
    name: 'ArrayToText',
    setup () {
        const isChange = ref(false)
        window.isChane = isChange
        return {
            isChange
        }
    },
    render () {
        const self = this
        return self.isChange ?
            h('div', {}, nextChildren) :
            h('div', {}, prevChildren)
    }
}

