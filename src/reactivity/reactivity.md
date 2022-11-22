## 响应式

### reactive

> vue官方文档中对`reactive`的描述是返回一个对象的响应式代理。即调用reactive方法得到的数据是响应式的，当该响应时对象发生变化时，依赖该对象的
>   表达式也会发生改变。  

### effect

#### 需要理清的问题

 - 第一次执行fn时get、set的流程（收集依赖）
 - activeEffect的指向

#### 关于依赖收集

 - 用来保存当前处于激活状态的effect
 - 因为effect中的fn会先被执行一次（执行fn的时候会触发响应时对象的get陷阱函数），且get陷阱函数中包含收集依赖的操作
 - `activeEffect = this`：在运行effect的run方法后且真正执行_fn之前，activeEffect被复制为当前执行的fn对应的effect
 - 因此在收集依赖时，可以通过 activeEffect 收集到当前fn对应的effect

#### 遇到的问题

```typescript
describe('effect', () => {
  it('happy path', () => {
    // 创建一个对象的响应式代理user
    const user = reactive({
      age: 10
    })
    let nextAge
    // nextAge的值依赖user对象，因为user是响应式的，所以user.age更新的时候，nextAge的值也会更新
    effect(() => {
      nextAge = user.age + 1
    })
    // 期望：nextAge的值等于11
    expect(nextAge).toBe(11)
    // user.age自增，nextAge的值也要更新
    user.age++
    console.log(user.age, '------------')
    // 代码正常运行到这里，nextAge的值应该已经更新为12
    // 期望：nextAge的值等于12
    expect(nextAge).toBe(12)
  })
})
```

> 实现`effect`的时候遇到一个问题，单测运行到`expect(nextAge).toBe(12)`的时候结果是单测执行不通过。期望nextAge等于12，但实际等于11，
>   检查了好几遍 effect 相关代码都没有问题，debug的时候发现问题出在了reactive里面。  
> 刚开始实现reactive的时候，并没有添加收集和触发依赖的逻辑（收集和触发依赖的逻辑是在实现effect的时候才加上的），
>   在get/set内部直接通过Reflect.get/set返回结果。后来实现effect时，需要添加收集、触发依赖相关的逻辑，
>   直接添加到了return之前，问题就出现在这里。  
> 目前的功能get倒不影响，但在set的时候，先触发了依赖，再调用的`Reflect.set`，因为set操作被拦截，在`Reflect.set`执行完毕之前，
>   `target[key]`（相当于单测中的user.age）的值并没有更新。  
> 再看set拦截方法的实现，先触发依赖，再执行的`Reflect.set`，触发依赖时候`target[key]`的值还是之前的值，set操作还没执行完毕。
>   所以得到的结果没有发生变化（11）。

```typescript
// 修改前
function reactiveError (raw) {
  return new Proxy(raw, {
    get(target, key) {
      track(target, key) // 收集依赖
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      trigger(target, key) // 触发依赖
      return Reflect.set(target, key, value)
    }
  })
}
// 修改后
function reactive (raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  })
}
```

#### runner

##### 描述

> 执行`effect`中的fn会返回一个函数（被称为runner），调用runner时会再次执行fn，并返回fn的返回值。

##### 实现

 effect返回ReactiveEffect实例的run方法（this指向），run方法调用的时候返回fn的执行结果

#### scheduler

##### 描述

> 通过 effect 的第二个参数-一个scheduler的 fn  
> effect 第一次执行的时候还会执行fn  
> 当响应式对象发生 set 的时候（更新的时候），不会执行fn，而是执行scheduler  
> 如果执行 runner 的时候，会再次执行fn

##### 实现

 effect接收第二个参数（options），将options.scheduler添加到ReactiveEffect上，触发依赖时判断之心`run`和`scheduler`  
