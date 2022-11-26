import { reactive } from '../reactive'
import { computed } from '../computed'

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({ age: 1 })
    const age: any = computed(() => user.age)
    expect(age.value).toBe(1)
  })

  it('should computed lazily', () => {
    const value = reactive({ foo: 1 })
    const getter = jest.fn(() => value.foo)
    const cValue: any = computed(getter)

    // 懒执行，不访问cValue.value的情况下，getter函数不会执行
    expect(getter).not.toHaveBeenCalled()

    // 访问.value调用了一次getter
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 再次访问，也应该只调用一次（TODO 1.缓存）
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // 更新getter依赖的值，重新调用一次
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // 访问 .value 返回2
    expect(cValue.value).toBe(2)
    // getter的调用次数为2
    expect(getter).toHaveBeenCalledTimes(2)

    // 再次访问，调用次数还是2（再次验证缓存功能）
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
