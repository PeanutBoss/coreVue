import { readonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped: any = readonly(original)
    expect(wrapped).not.toBe(original)
    // expect(isReadOnly(wrapped)).toBe(true)
    // expect(isReadOnly(original)).toBe(false)
    // expect(isReadOnly(wrapped.bar)).toBe(true)
    // expect(isReadOnly(original)).toBe(false)
    // expect(isProxy(wrapped)).toBe(true)
    expect(wrapped.foo).toBe(1)
  })
  it('warn then call set', () => {
    console.warn = jest.fn()
    const user: any = readonly({ age: 10 })
    user.age = 11
    expect(console.warn).toBeCalled()
  })
})
