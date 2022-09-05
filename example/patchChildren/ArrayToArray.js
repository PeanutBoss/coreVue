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
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B')
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B')
// ]

/*
* 4-1.老的比新的长 - 删除老的 - 左侧
* (a b) c
* (a b)
* i = 2, e1 = 2, e2 = 1
* */
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B')
// ]

/*
* 4-2.老的比新的长 - 删除老的 - 右侧
* a (b c)
* (b c)
* */
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C')
// ]

/*
* 5-1.对比中间 - 删除老的 - 老的多新的少
* a b (c d) f g
* a b (e c) f g
* */
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C', id: 'c-next' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

/*
* 5-2.对比中间 - 删除老的 - 多出来的部分直接删掉
* */
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C', id: 'c-prev' }, 'C'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C', id: 'c-next' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

/*
* 6-1.最长递增子序列
* */
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

/*
* 6-2.创建新的节点
* */
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'G' }, 'G')
// ]

/*
* 6-3.综合案例
* */
const prevChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'Z' }, 'Z'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G')
]
const nextChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'Y' }, 'Y'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G')
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

