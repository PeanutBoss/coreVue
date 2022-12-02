## 响应式篇核心

 - effect
 - reactive
 - ref
 - computed
 - watch

|     功能点    |                     描述                         |     工作流程     |
|--------------|--------------------------------------------------|----------------|
|    effect    |          贯穿整个响应式系统，收集依赖的入口          |                |
|   reactive   |             返回引用类型的响应式代理                |                |
|      ref     |    返回基本数据类型的响应式代理（引用类型也可以）      |                |
|  computed    |                                                  |                |
|     watch    |                                                  |                |

### 响应式数据与副作用函数

函数执行使某个全局变量、页面内容、页面样式等发生变化，像这样产生副作用的函数被称为副作用函数。  

下面的effect修改了页面中的内容，它就是一个副作用函数
```javascript
const obj = { text: 'hello world' }
function effect () {
  document.body.innerText = obj.text
}
```
执行上面的effect方法，会将页面内容设置为`obj.text`的值 —— 'hello world'。  
```javascript
obj.text = 'hello vue3'
```
当`obj.text`发生变化时，希望副作用函数`effect`可以自动执行，如果能实现这个目标，那么对象obj就是一个响应式数据。  
但目前来看，还做不到这一点，因为obj是一个普通对象，修改它时除了对象本身发生变化，不会有其他响应。

---

接上面内容思考，那么该怎么样将`obj`变成响应式对象呢？观察上面`effect`函数和写入`obj.text`这两个操作可以发现
 - 副作用函数`effect`执行时，会触发字段`obj.text`的读取操作  
 - 当修改`obj.text`的值时，会触发字段`obj.text`的设置操作

如果可以根据上面结论拦截一个对象的读取和设置操作，事情就变得简单了，读取字段`obj.text`时，可以把副作用函数`effect`保存到一个Set结构中，
当设置`obj.text`时，再取出副作用函数并执行它。

```javascript
// 存储副作用的容器
const bucket = new Set()
// 原始数据
const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get(target, key) {
    // 将副作用函数添加到容器中
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  set(target, key, value) {
    // 设置属性值
    target[key] = value
    // 把副作用函数从容器中取出并只执行
    bucket.forEach(fn => fn())
    // 返回 true 代表设置操作成功
    return true
  }
})
```

目前的响应式系统还存在很多的缺陷，比如直接通过名字 effect 来获取副作用函数，这种硬编码方式不灵活。副作用函数的名字可能不是effect，或者可能
是一个匿名函数，因此必须要优化这种硬编码的机制。  

---

从上面的例子可以发现：
 - 当读取操作发生时，将副作用函数收集起来
 - 当设置操作发生时，将副作用函数取出并执行

因此我们可以用一个全局变量存储被注册的副作用函数，而effect用来注册副作用函数

#### 响应式系统核心工作流程

```javascript
const obj = { name: '蒙奇·D·路飞', age: 16 }
const proxy = reactive(obj)
effect(() => {
  document.write(`${obj.name}`)
})
obj.name = '罗罗诺亚·索隆'
```

> 上面这段代码中存在三个角色，  
>   1.被读取/设置的代理对象obj  
>   2.被读取/设置的字段名name  
>   3.使用effect函数注册的副作用函数`fn`  
>
> 这三个角色可能存在以下五种关系
>  - target
>    - key
>      - effectFn  
>   一个副作用函数依赖一个响应式对象的一个key；对应代码：  
>   `effect(() => { document.write(`${obj.name}`) })`
> 
>  - target
>    - key
>      - effectFn1
>      - effectFn2  
>   两个副作用函数依赖同一个响应式对象的同一个key；对应代码：  
>   `effect(() => { document.write(`${obj.name}`) })`  
>   `effect(() => { console.log(`${obj.name}`) })`
>      
>  - target
>    - key1
>      - effectFn1
>    - key2
>      - effectFn2  
>   两个副作用函数依赖同一个响应式对象的不同key；对应代码：  
>   `effect(() => { document.write(`${obj.name}`) })`  
>   `effect(() => { document.write(`${obj.age}`) })`  
>  
>  - target1
>    - key1
>      - effectFn1
>  - target2
>    - key2
>      - effectFn2  
>   两个副作用函数依赖不同的响应式对象的key；对应代码：  
>   `effect(() => { document.write(`${obj1.name}`) })`  
>   `effect(() => { document.write(`${obj2.age}`) })`  
>
>  - target
>    - key1
>      - effectFn
>    - key2
>      - effectFn  
>   同一个副作用函数依赖同一个响应式对象的不同key；对应代码：  
>   `effect(() => { document.write(`${obj.name}${obj.age}`) })`  

根据以上内容，可以得出以下结论：
 - 1.一个应用可能存在多个对象
 - 2.一个对象可能存在多个key
 - 3.一个key可能对应多个副作用函数
 
那么该如何映射这些依赖、key和对象的关系呢？  

从大到小来说，触发或收集依赖时，先根据对象`target`从targetMap中查找到这个对象下的所有key对应的所有依赖集合`keyDeps`，
再根据对象的属性`key`从keyDeps中查找到这个key对应的所有依赖项`dep`。


|     数据结构   |               键              |               值                 |
|--------------|-------------------------------|---------------------------------|
|    WeakMap   |        target（原始对象）       |               Map               |
|      Map     |       （原始对象的）key         |                Set              |
|      Set     |                /             |             副作用函数            |

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5442d093405443f82e6b07e837ede93~tplv-k3u1fbpfcp-watermark.image?)

_结合上如果能理清这三个角色和依赖之间的映射关系，可以跳过划掉的部分_  
~~从小到大来说，一个key可能对应多个依赖项，我们可以将这些依赖项放入一个数组中，因为在触发依赖时，~~
  ~~一个副作用函数只需要被执行一次，所以要保证这些依赖项是唯一的，因此一个key对应的依赖集合通过Set来保存。~~
  ~~给依赖集合起名为dep~~  
~~接着，一个对象可能存在多个key，这个key和它的依赖集合也需要有一个映射关系，~~
  ~~我们就可以通过一个Map来保存，以key作为Map的键，以依赖集合（Set）作为Map的值。~~
  ~~给Map起名为keyDeps，它里面保存的是所有key和key的依赖集合~~  
~~最后，一个应用中可能存在多个响应式对象，这个响应式对象和上一步的Map也需要有一个映射关系，我们可以通过WeakMap~~
  ~~来收集，以对象作为WeakMap的键，以Map作为WeakMap的值。~~
  ~~给WeakMap起名为targetMap，它里面保存的是一个对象和对象下的所有key对应的所有依赖集合  ~~

---

 - 使用reactive为原始对象创建一个响应式代理，副作用函数执行时会使用这个响应式代理  
 - effect会作为整个系统的入口，给它传入一个副作用函数（fn），`effect`会以`fn`为参数创建一个`ReactiveEffect`实例（一个依赖项）  
 - 然后调用该实例的run方法，把当前依赖项保存到`activeEffect`中并且将fn先执行一次来触发它的get操作  
 - get操作被代理拦截，会先执行`track`  
 - track先根据 targetMap 和 被访问的对象 获取到 这个对象所有属性 对应的依赖（keyDeps）  
 - 再根据 keyDeps 和 访问的 key 获取到这个key对应的所有依赖（dep）  
 - 再将当前依赖项（activeEffect）保存到dep中  
 - 到这一步依赖收集完毕  
 - 接着修改`obj.name`，触发obj的set操作  
 - 先将`obj.name`的值更新（对应代码是`Reflect.set(target, key, value)`），接着会执行trigger  
 - trigger先根据 targetMap 和 被访问的对象 获取到 这个对象所有属性 对应的依赖（keyDeps）  
 - 再根据 keyDeps 和 访问的 key 获取到这个key对应的所有依赖  
 - 然后遍历，执行所有依赖项的`run`方法（run方法实际上就是执行一次传入effect的副作用函数）  
 - emmmmmmm整体流程就是这样  

### 完整代码
```javascript
// 暂存当前的依赖项
let activeEffect
// 保存所有的依赖
let targetMap = new WeakMap()

// 创建一个依赖项
class ReactiveEffect {
  // 保存副作用函数
  _fn
  constructor(fn) {
    this._fn = fn
  }
  run () {
    // 将当前实例暂存起来，方便track时收集
    activeEffect = this
    // 默认执行一次副作用函数
    this._fn()
  }
}

function effect (fn) {
  // 根据副作用函数创建一个依赖项
  const _effect = new ReactiveEffect(fn)
  // 调用这个依赖项的run方法
  _effect.run()
}

// 接收一个原始对象，返回一个它的响应式代理
function reactive (raw) {
  return new Proxy(
      raw,
      {
        // 响应式对象get操作的拦截方法
        get(target, key) {
          // 收集依赖
          track(target, key)
          // 返回读取结果
          return Reflect.get(target, key)
        },
        // 响应式对象set操作的拦截方法
        set(target, key, value) {
          // 先更新原始对象的值
          const res = Reflect.set(target, key, value)
          // 触发依赖
          trigger(target, key)
          return res
        }
      }
  )
}

// 收集依赖
function track (target, key) {
  // 获取target对象所有key与key对应依赖集合的Map
  let keyDeps = targetMap.get(target)
  // 如果没有值
  if (!keyDeps) {
    // 创建
    keyDeps = new Map()
    // 以 key-value: target-keyDeps 形式保存到targetMap中
    targetMap.set(target, keyDeps)
  }
  // 获取key对应的所有依赖
  let dep = keyDeps.get(key)
  // 如果不存在
  if (!dep) {
    // 创建
    dep = new Set()
    // 将dep保存到keyDeps中
    keyDeps.set(key, dep)
  }
  // 单独读取响应式代理时（不是在函数中读取），activeEffect为undefined
  // 因此收集依赖时需要加判空操作
  if (!activeEffect) return
  // 将当前的依赖项保存起来
  dep.set(activeEffect)
}

// 触发依赖
function trigger (target, key) {
  // 与收集依赖同理
  const keyDeps = targetMap.get(target)
  const dep = keyDeps.get(key)
  // 找到key对应的依赖集合，遍历执行每个依赖的run方法
  for (const effect of dep) {
    effect.run()
  }
}
```


