import { reactive } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    // 创建代理对象
    const observed = reactive(original)
    // 代理对象不等于原始对象
    expect(observed).not.toBe(original)
    // 代理对象的foo属性等于1
    expect(observed.foo).toBe(1)
    // isReactive(observed) === true
    // expect(isReactive(observed)).toBe(true)
    // expect(isReactive(original)).toBe(false)
    // expect(isProxy(observed)).toBe(true)
  })
})

// // 测试嵌套对象
// describe('nested reactive', () => {
//   const original = {
//     nested: { foo: 1 },
//     array: [{ bar: 2 }]
//   }
//   // 创建嵌套对象的代理
//   const observed = reactive(original)
//   // 代理对象的nested属性是reactive
//   expect(isReactive(observed.nested)).toBe(true)
//   // 代理对象的array属性是reactive
//   expect(isReactive(observed.array)).toBe(true)
//   // 代理对象的array属性的第一项是reactive
//   expect(isReactive(observed.array[0])).toBe(true)
// })
