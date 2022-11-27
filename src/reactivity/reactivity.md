## 响应式

### reactive

> vue官方文档中对`reactive`的描述是返回一个对象的响应式代理。即调用reactive方法得到的数据是响应式的，当该响应时对象发生变化时，依赖该对象的
>   表达式也会发生改变。  

#### readonly

##### 描述

> 创建只读的响应式代理，不能被set

##### 实现

> get陷阱函数不需要收集依赖


#### isReadonly && isReactive

##### 描述

> isReadonly：检查对象是不是Readonly；isReactive：检查对象是不是Reactive

##### 实现

> 触发对象的get陷阱函数，对特殊的key进行处理


#### reactive/readonly嵌套

> reactive接受一个对象，这个对象的属性值也可能是一个对象，但reactive只对外层对象做了处理  
> 需要在返回结果的时候进行判断，如果结果是对象，则需要用reactive进行包装；readonly同理

#### shallowReadonly

> shallowReadonly与readonly类似，区别在于shallowReadonly只会代理最外层的对象，不会做嵌套处理

#### isProxy

> 只要是readonly或reactive，就是proxy



### ref

#### 描述

> 与reactive类似，区别在于ref出现的目的是处理基本数据类型（也可以处理引用类型），调用ref返回响应式代理，通过value属性访问  

#### 实现

> 因为基本数据类型不能被代理，因此ref在调用后会返回一个Ref实例，Ref实例包含一个访问器属性 value，收集和触发依赖的动作
>   在value的get和set执行时触发

#### isRef

> 接收一个对象判断该对象是否时ref的实例  
>   ref实例上有特殊的key，通过判断是否存在这个key来确认是否是ref

#### unRef

> 返回一个ref的原始数据  

#### proxyRef

> 接收一个对象返回它的响应式代理。目的是为了访问ref时省略 .value 的操作  
> set的时候，在当前值是ref且将要更新的值不是ref的情况下，那么更新的就是当前值的value属性；
>   否则（当前值和将更新的值都是ref或都不是ref），直接执行替换操作

#### toRef / toRefs

> 解决响应丢失问题，返回一个新对象，为该对象添加访问器属性，在get方法中通过访问响应式数据
>   来触发响应式对象的get方法



### computed

**特点：懒执行、有缓存**  

#### 实现

> 通过返回一个 Computed 类来实现，与ref相似，提供一个value访问器访问器属性，触发get操作的时候执行传入的getter实现懒执行  
>   每次执行把这次的执行结果保存起来，再加一个是否需要清除缓存的标识。如果getter依赖的响应式对象发生变化，修改标识，下一次触发
>   get操作的时候就会重新计算。



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
>   以前有理解错误的地方，以为会需要收集依赖，实际上只需要重新执行fn  

##### 实现

 effect返回ReactiveEffect实例的run方法（this指向），run方法调用的时候返回fn的执行结果


#### scheduler

##### 描述

> 通过 effect 的第二个参数-一个scheduler的 fn  
> effect 第一次执行的时候还会执行fn  
> 当响应式对象发生 set 的时候（更新的时候），不会执行fn，而是执行scheduler  
> 如果执行 runner 的时候，会再次执行fn

##### 实现

 effect接收第二个参数（options），将options.scheduler添加到ReactiveEffect上，触发依赖时判断执行`run`和`scheduler`  


#### stop

##### 描述

> 调用stop方法（传入runner），当更新响应式对象的时候将不会触发依赖；再次调用runner，恢复更新

##### 实现

 - 1.触发依赖是遍历执行依赖集合中所有effect的run/scheduler方法，因此停止触发依赖，需要在stop的时候将 effect 从依赖集合中删除即可  
 - 2.收集依赖的时候将effect添加到一个key对应的依赖集合中，删除依赖的时候需要找到依赖集合，因此需要通过effect反向收集dep  
 - 3.一个fn中可能依赖多个响应式数据，因此effect可能会收集多个dep（开始没理解的一些问题）

##### 实现遇到的问题

 - 1.activeEffect为空的问题，读取depsList时报错
 
##### 优化

> 当执行 target.key++ 的时候会执行get、set操作，已经stop的副作用函数在get的时候依赖会被重新收集  
>   因此执行run方法时应该判断当前副作用是不是处于stop状态（active = false说明是stop状态，不需要收集依赖）。  



## 响应式总结

首先要说的是响应式核心的三个API reactive、ref、effect  
reactive、ref的作用都是返回一个响应式代理，reactive针对引用类型，ref针对基本类型（引用类型也可以）  
effect接收一个副作用函数，当这个副作用函数依赖的响应式对象发生变化的时候会重新调用这个副作用函数  

### 文章流程

 - 1.什么是副作用函数？什么是响应式数据？
 - 2.WeakMap和Map（weakMap的键不能是对象，symbol也不可以）
