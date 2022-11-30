## 响应式篇

~~我也想能与你搭起桥梁~~

待解答问题  
 - ~~1.为什么使用Set保存key对应的依赖项~~
 - 2.为什么使用WeakMap结构收集所有对象和它的依赖，Map结构收集所有key和它的依赖

工作内容
 - 1.读取原始对象
 - 2.设置原始对象
 - 3.触发响应式代理的get操作
 - 4.触发响应式代理的set操作
 - 5.收集依赖
 - 6.触发依赖

|     功能点    |                     描述                        |     工作流程     |
|--------------|------------------------------------------------|----------------|
|    effect    |          贯穿整个响应式系统，收集依赖的入口          |           |
|   reactive   |             返回引用类型的响应式代理               |          |
|      ref     |    返回基本数据类型的响应式代理（引用类型也可以）      |          |

|     数据结构    |               键               |             值                 |
|--------------|-------------------------------|--------------------------------|
|    WeakMap    |        target（原始对象）       |              Map              |
|      Map      |       （原始对象的）key         |               Set            |
|      Set     |                /              |           副作用函数           |

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

因此我们可以用一个全局变量存储被注册的副作用函数，effect用来注册副作用函数

```javascript
function effect (fn) {
  activeEffect = fn
  fn()
}
```

target-key-value对应关系

 - target
   - key
     - effectFn

 - target
   - key
     - effectFn1
     - effectFn2
     
 - target
   - key1
     - effectFn1
   - key2
     - effectFn2
 
 - target1
   - key1
     - effectFn1
 - target2
   - key2
     - effectFn2

 WeakMap === target --> Map  
 Map === key --> Set  
 Set === fn1、fn2、fn3...


