/* 减少DOM操作 */
const DOM = {
  oldVNode: {
    type: 'div',
    children: [
      { type: 'p', children: '1' },
      { type: 'p', children: '2' },
      { type: 'p', children: '3' }
    ]
  },
  newVNode: {
    type: 'div',
    children: [
      { type: 'p', children: '4' },
      { type: 'p', children: '5' },
      { type: 'p', children: '6' }
    ]
  }
}

/* DOM复用与key的作用 */
const ELEMENT = {
  oldVNode: [
    { type: 'p' },
    { type: 'div' },
    { type: 'span' }
  ],
  newVNode: [
    { type: 'span' },
    { type: 'p' },
    { type: 'div' }
  ]
}

const TYPE = {
  oldChildren: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ],
  newChildren: [
    { type: 'p', children: '3' },
    { type: 'p', children: '1' },
    { type: 'p', children: '2' }
  ]
}

const KEY = {
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ],
  newChildren: [
    { type: 'p', children: '3', key: '3' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' }
  ]
}

const KEY2 = {
  oldVNode: { type: 'p', children: 'text - 1', key: '1' },
  newVNode: { type: 'p', children: 'text - 2', key: '1' }
}
