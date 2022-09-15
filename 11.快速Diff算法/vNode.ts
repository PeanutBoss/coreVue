const oldChildren = [
  { type: 'p', key: '1' },
  { type: 'p', key: '2' },
  { type: 'p', key: '3' }
]
const newChildren = [
  { type: 'p', key: '1' },
  { type: 'p', key: '4' },
  { type: 'p', key: '2' },
  { type: 'p', key: '3' }
]

function namespace () {
  const oldChildren = [
    { type: 'p', key: '1' },
    { type: 'p', key: '3' }
  ]
  const newChildren = [
    { type: 'p', key: '1' },
    { type: 'p', key: '2' },
    { type: 'p', key: '3' }
  ]
}

function isNeedMove () {
  const oldChildren = [
    { type: 'p', key: '1' },
    { type: 'p', key: '3' },
    { type: 'p', key: '4' },
    { type: 'p', key: '2' },
    { type: 'p', key: '7' },
    { type: 'p', key: '5' }
  ]
  const newChildren = [
    { type: 'p', key: '1' },
    { type: 'p', key: '2' },
    { type: 'p', key: '3' },
    { type: 'p', key: '4' },
    { type: 'p', key: '6' },
    { type: 'p', key: '5' }
  ]
}
