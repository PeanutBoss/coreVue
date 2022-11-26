import { effect } from "../effect";
import { ref, isRef, unRef, proxyRef } from '../ref'
import { reactive } from '../reactive'

describe('ref', () => {
  it('happy path', () => {
    // 创建一个ref：a
    const a = ref(1)
    // a.value === 1
    expect(a.value).toBe(1)
  })

  it('should be reactive', () => {
    // 创建一个ref：a
    let a: any = ref(1)
    let dummy
    // 声明一个变量用来计数
    let calls = 0
    // 通过effect做依赖收集
    effect(() => {
      calls++
      dummy = a.value
    })
    // 上一步effect做依赖收集回先执行一次传入的fn，calls === 1，dummy === 1
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    // 设置value的值，触发set
    a.value = 2
    // 传入effect的fn又执行了一次，calls计数加1：calls === 2，触发依赖后dummy === 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    /*
    * 再次修改a.value的值，和上一次的值相等，那么它就不应该触发依赖
    * calls不变：calls === 2
    * 没有触发依赖：dummy === 2
    * */
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('test object use ref', function () {
    const original = { age: 1 }
    // 创建一个ref：a
    let a: any = ref(original)
    let dummy
    // 声明一个变量用来计数
    let calls = 0
    // 通过effect做依赖收集
    effect(() => {
      calls++
      dummy = a.value.age
    })
    // 上一步effect做依赖收集回先执行一次传入的fn，calls === 1，dummy === 1
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    // 设置value的值，触发set
    a.value.age = 2
    // 传入effect的fn又执行了一次，calls计数加1：calls === 2，触发依赖后dummy === 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    /*
    * 再次修改a.value的值，和上一次的值相等，那么它就不应该触发依赖
    * calls不变：calls === 2
    * 没有触发依赖：dummy === 2
    * */
    a.value = original
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  /*
   * isRef和unRef的实现主要在于Ref类中新增的__v_isRef属性
   *   用它来判断是否是ref，或进行操作
   */
  it('isRef', () => {
    // 生命两个响应式数据 a 和 user
    const a = ref(1)
    const user = reactive({ a: 1 })
    // a 是ref
    expect(isRef(a)).toBe(true)
    // 1不是
    expect(isRef(1)).toBe(false)
    // user不是ref
    expect(isRef(user)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(1)
    // 如果传入的值是ref，返回原始值
    expect(unRef(a)).toBe(1)
    // 如果是原始值，返回本身
    expect(unRef(1)).toBe(1)
  })

  it.skip('proxyRef', () => {
    const user = {
      age: ref(10),
      name: 'lufei'
    }
    const proxyUser: any = proxyRef(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('lufei')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    // proxyUser.age = ref(10)
    // expect(proxyUser.age).toBe(10)
    // expect(user.age.value).toBe(10)
  })
})

it('should make nested properties reactive', () => {
  // 如果ref接受的值是一个对象
  const a = ref({ count: 1 })
  let dummy
  // 它的值也是通过.value去取的
  effect(() => {
    dummy = a.value.count
  })
  // 调用effect会调用传入的fn，dummy === 1
  expect(dummy).toBe(1)
  // 修改ref的值
  a.value.count = 2
  // dummy的值也会被修改
  expect(dummy).toBe(2)
})
