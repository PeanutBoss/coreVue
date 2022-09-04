const DOM = {
  oldVNode: {
    type: 'div',
    children: [
      { type: 'p', children: '1', key: '1' },
      { type: 'p', children: '2', key: '2' },
      { type: 'p', children: '3', key: '3' },
    ]
  },
  newVNode: {
    type: 'div',
    children: [
      { type: 'p', children: '3', key: '3' },
      { type: 'p', children: '1', key: '1' },
      { type: 'p', children: '2', key: '2' }
    ]
  }
}

const start = {
  newChildren: [
    { type: 'p', children: '4', key: '4' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '3', key: '3' }
  ],
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' },
    { type: 'p', children: '4', key: '4' }
  ]
}

const usual = {
  newChildren: [
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '4', key: '4' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '3', key: '3' }
  ],
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' },
    { type: 'p', children: '4', key: '4' }
  ]
}

const increment = {
  newChildren: [
    { type: 'p', children: '4', key: '4' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '3', key: '3' },
    { type: 'p', children: '2', key: '2' }
  ],
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ]
}

const incrementV2 = {
  newChildren: [
    { type: 'p', children: '4', key: '4' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ],
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ]
}

const decrement = {
  newChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '3', key: '3' }
  ],
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ]
}
