import {isReadOnly, shallowReadonly} from '../reactive'

/*
* 只能是最外层的一层是响应式对象
* 即表层是一个响应式对象，内部呢就是普通对象
* */
describe('shallowReadonly', () => {
  test('should not make non-reactive properties readtive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadOnly(props)).toBe(true)
    expect(isReadOnly(props.n)).toBe(false)
  })
  // 因为它也是 readonly的一种，所以set的时候也需要满足readonly的条件
  // 将readonly的单元测试搬过来稍微修改下
  it('warn then call set', () => {
    console.warn = jest.fn()
    const user = shallowReadonly({ age: 10, name: { firstName: '罗罗诺亚' } })
    user.age = 11
    expect(console.warn).toBeCalled()
    // user.name.lastName = '索隆'
    // expect(console.warn).not.toBeCalled()
  })
})
