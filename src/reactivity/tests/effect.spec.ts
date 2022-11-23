import { reactive } from '../reactive'
import { effect } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // ---reactive--- 4.收集依赖 -> 5.实现依赖收集
    user.age++
    console.log(user.age, '------------')
    expect(nextAge).toBe(12)
  })
})

it('should return runner when call effect', () => {
  let foo = 10
  // 传入effect的fn，执行时foo会递增且返回字符串foo
  const runner = effect(() => {
    foo++
    return 'foo'
  })
  // 期望：foo = 11
  expect(foo).toBe(11)
  const r = runner()
  // 期望：foo = 12
  expect(foo).toBe(12)
  // 期望：r = ‘foo’
  expect(r).toBe('foo')
})

/*
* 1.通过 effect 的第二个参数-一个scheduler的 fn
* 2.effect 第一次执行的时候还会执行fn
* 3.当响应式对象发生 set 的时候（更新的时候），不会执行fn，而是执行scheduler
* 4.如果执行 runner 的时候，会再次执行fn
* */
it('scheduler', () => {
  let dummy
  let run: any
  const scheduler = jest.fn(() => {
    run = runner
  })
  const obj = reactive({ foo: 1 })
  const runner = effect(() => {
    dummy = obj.foo
  }, { scheduler })
  // scheduler不会被调用
  expect(scheduler).not.toHaveBeenCalled()
  // 期望：dummy = 1
  expect(dummy).toBe(1)
  // foo递增，触发依赖
  obj.foo++
  // 期望：dummy = 1
  expect(dummy).toBe(1)
  run()
  // dummy = 2
  expect(dummy).toBe(2)
})

// it('stop', () => {
//   let dummy
//   const obj = reactive({ prop: 1 })
//   const runner = effect(() => {
//     dummy = obj.prop
//   })
//   obj.prop = 2
//   expect(dummy).toBe(2)
//   stop(runner)
//
//   // obj.prop = 3
//
//   obj.prop++
//   // obj.prop = obj.prop + 1  触发了get和set
//   /*
//   * 执行fn的时候会执行响应式对象的get操作，会把依赖重新收集起来
//   * 所以解决方法是执行fn的时候不让它重新收集依赖
//   * */
//
//   expect(dummy).toBe(2)
//   runner()
//   expect(dummy).toBe(3)
// })

// it('onStop', () => {
//   const obj = reactive({
//     foo: 1
//   })
//   const onStop = jest.fn()
//   let dummy
//   const runner = effect(() => {
//     dummy = obj.foo
//   }, { onStop })
//   stop(runner)
//   expect(onStop).toBeCalledTimes(1)
// })
