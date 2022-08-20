import { ReactiveEffect } from './effect'

/*
* 计算属性的实现比较巧妙，在调用 computed 的时候呢，创建了一个ComputedRefImpl类的实例，
*   这个实例在创建的时候将传入computed的 fn 作为effect的参数，将依赖收集了起来，并传入了
*   scheduler参数。传入的scheduler函数就可以在依赖的响应式对象发生改变的时候将_dirty重置为true
* */

/*
* computed流程：
*   1.初始化computedRefImpl实例的时候会将依赖收集起来
*   2.当访问它时回去调用它的 run 方法将传入的 fn 执行结果保存并返回，而且将实例的dirty修改为false（标识已经有了缓存）
*   2-1.后面再调用的时候（依赖没有变化的情况下）会直接返回fn在上次的执行结果
*   3.依赖发生变化的时候，会调用传入的scheduler将实例的dirty改为true，表示没有缓存最新结果
*   4.当再次调用实例的 get 方法时（访问computed），会执行实例的_effect的run方法，将fn的最新结果返回。
* */

/*
* 响应式对象发生 set 操作后，它会去触发一个trigger，所以我们可以将它的依赖收集起来（所以下面在创建
*   computedRefImpl实例的时候使用了ReactiveEffect，用来收集依赖）。
* */

class ComputedRefImpl {
  private _getter: any // 保存传入的 fn 函数
  private _dirty: boolean = true // 用来标识有没有缓存,true代表没有缓存
  private _value: any // 保存上一次的值
  private _effect: any
  constructor(getter) {
    // this._getter = getter
    this._effect = new ReactiveEffect(
      getter,
      () => {
        if (!this._dirty) this._dirty = true
      }
    )
  }
  get value () {
    /*
    * 当依赖的响应式对象的值发生改变的时候，需要将dirty改为true
    * */
    if (this._dirty) { // 如果没有缓存
      this._dirty = false // 取反
      this._value = this._effect.run()
    }
    /*
    * 返回 getter 的执行结果
    * 如果有缓存（dirty为false），将不会再去执行 fn 函数
    * */
    return this._value
  }
}

export function computed (getter) {
  return new ComputedRefImpl(getter)
}
