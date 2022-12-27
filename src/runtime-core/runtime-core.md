## 运行时

### 初始化component主流程

 - 创建App实例
 > App实例就是一个对象，包含mount方法，该方法接收一个dom节点，将App实例挂载到这个dom节点上。  
 > mount：将组件转为虚拟节点 -> 调用render函数渲染
 
 - render
 > 先对虚拟节点进行打补丁操作-patch

 - patch
 > 开始处理组件（应该先判断是组件还是html元素，这里只考虑组件）

 - processComponent
 > 开始处理组件

 - mountComponent
 > 创建组件实例

   - createComponentInstance
   > 返回一个 component 对象  
   > 处理setup方法

   - setupComponent
   > 初始化props、slots  
   > 处理组件状态

   - setupRenderEffect
   > 调用render方法获取到组件树  
   > patch打补丁
 
 - setupStatefulComponent
 > 获取到组件信息  
 > 拿到setup执行结果-setupResult  
 > setup如果返回一个function，就认为它是这个组件的render函数
 
 - handleSetupResult（后续需要实现function）
 > 完成组件的处理组件的setup

 - finishComponentSetup
 > 获取component，如果有render，调用render渲染

### 初始化element主流程

 - 创建App实例
 > App实例就是一个对象，包含mount方法，该方法接收一个dom节点，将App实例挂载到这个dom节点上。  
 > mount：将组件转为虚拟节点 -> 调用render函数渲染

 - render
 > 先对虚拟节点进行打补丁操作-patch

 - patch
 > 开始处理组件（应该先判断是组件还是html元素，这里只考虑组件）

 - processElement
 > 开始处理element

 - mountElement
   - 子节点是string类型
   > 创建元素并上树
   > - 创建元素
   > - 添加属性和内容
   > - 上树
 
   - 子节点是array类型
   > 创建元素
   > 对每一个子节点都进行patch
   > 这时的容器新创建的元素
   > 上树

### 代理this
> `this.msg`是在render函数执行时访问，改变render函数中的this指向为一个代理对象。

### $el
> 挂载元素的时候将创建的el添加到虚拟节点上；访问render函数的this（绑定的代理对象）时，通过拦截$el
>   属性返回真实的DOM节点（存在一个问题，el是被添加到元素的虚拟节点上了，这时render函数的this是组件的虚拟节点）。
>   解决这个问题需要在获取子节点树之后（真实DOM对应的虚拟节点），从子节点树上可以拿到这个组件对应的el。  
> setupRenderEffect实际上就是将一个组件的虚拟节点处理为对应的element的虚拟节点。  

_为组件实例绑定render函数时候改变render函数内this的指向（视频中是在调用实例的render函数时修改this指向）。_
_看起来思路更清晰一些_  

#### 重构-componentPublicInstance
 - PublicInstanceHandlers = proxy
 - publicPropertiesMap = {}

### ShapeFlags
**位运算**  
```js
// 下面是n1 n2的补码
const n1 = '0000 0001'
const n2 = '0000 0101'
// |两位任何一位为1，那么结果为1
// & 两位都为1，那么结果为1
// n1 | n2 = '0000 0101'
// n1 & n2 = '0000 0001'
```

**为虚拟节点添加shapeFlag属性，用来描述节点类型**  
_使用位运算可以使用 0101 来标识节点同时属于哪个类型_  

 - ELEMENT 1
 - STATEFUL_COMPONENT 1 << 1
 - TEXT_CHILDREN 1 << 2
 - ARRAY_CHILDREN 1 << 3

> 为vNode添加shapeFlag属性，标识当前节点是什么类型。  
> getShapeFlag判断当前vNode是不是组件类型，还需要通过children来判断子节点的类型

### 事件绑定

### 实现组件props
 - props作为setup方法的参数
 - shallowReadonly

### emit
> 将emit方法挂载到组件实例上（初始化组件的时候）  
> 绑定emit的第一个参数  
> 从props中获取到对应事件处理方法并执行  
> 传参  
> 事件名带"-"  

### slots
> 组件的默认插槽实际上就是该组件的children，渲染组件时将组件的children一起渲染出来就可以  
> 关键是怎么获取到这个children，实现$slots（类似于props）  

 - renderSlots：需要支持传入数组（多个节点）
 > h函数能处理子节点类型为`[]vNode`，处理不了`vNode`或`[][]vNode`，renderSlots需要处理类型  
 > 进一步处理单个虚拟节点的，即vNode类型的（将vNode类型转为[]vNode类型）

#### 具名插槽
> 之前的插槽都是通过数组来使用的，换成对象（用key来获取要渲染的元素和位置）
> 处理initSlots（支持对象）、renderSlots（支持对象）

 - 获取要渲染的元素
 - 获取要渲染的位置

#### 作用域插槽
> 将插槽改为函数形式，props作为参数传递  
> 一共有两层调用，第一次初始化slots，为slots添加要渲染的元素时要调用函数（调用函数返回的是拿到数据的h函数）  
> 因为在渲染slots时还会调用slot，所以在上一步需要将其封装为函数（调用函数返回的是具体的虚拟节点）  

#### 代码
```js
// 获取组件的插槽实际上就是获取组件的children
function initSlots (instance, children) {
    // instance.slots = children
    // instance.slots = Array.isArray(children) ? children : [children]

    // 3.实现具名插槽
    // const slots = {}
    // for (const key in children) {
    //     // 如果子节点不是数组就转为数组
    //     slots[key] = Array.isArray(children[key]) ? children[key] : [children[key]]
    // }
    
    // 4.实现作用域插槽
    const slots = {}
    for (const key in children) {
        /*
        * 实现具名插槽的时候，这里的value就已经是一个虚拟节点了
        * 但是在实现作用域插槽的时候，value在这里是一个函数，如`({age}) => h('div', {}, 'header' + age)`
        * 需要调用一次才能获取到虚拟节点
        * */
        // const value = children[key]
        // const vNode = value()
        // slots[key] = Array.isArray(vNode) ? vNode : [vNode]

        /*
        * 因为在最后渲染的时候需要依赖props，`return createVNode('div', {}, slot(props))`
        * 所以要再将其包装为函数
        * */
        const value = children[key]
        // 这段代码在渲染的时候才会执行，渲染时接收到props，最后执行操作返回vNode
        slots[key] = props => Array.isArray(value(props)) ? value(props) : [value(props)]
    }
}

function renderSlots (slots, name, props) {
    // 1/2.实现插槽内容为单个虚拟节点或一组虚拟节点
    // return createVNode('div', {}, slots)
    // 3.具名插槽
    const slot = slots[name]
    // if (slot) return createVNode('div', {}, slot)
    // 4.作用域插槽
    if (slot) return createVNode('div', {}, slot(props))
}

const SlotComp = {
    setup () {},
    render() {
        const age = 20
        const foo = h('div', {}, 'slotComp')
        // 1.render函数不能直接处理数组类型的子节点，需要将其转为vNode
        return h('div', {}, [foo, h('div', {}, this.$slots)])
        return h('div', {}, [foo, renderSlots(this.$slots)])

        // 2.上面做法实现后，又不支持单个vNode类型的子节点了
        // 初始化插槽的时候（给实例添加插槽的时候），判断children是不是数组类型，如果不是则包装成数组

        // 3.实现具名插槽
        // return h('div', {}, [renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'footer')])
        
        // 4.实现具名插槽
        return h('div', {}, [
            renderSlots(this.$slots, 'header', { age }),
            foo,
            renderSlots(this.$slots, 'footer')
        ])
    }
}

const App = {
  name: 'App',
  render () {
    window.self = this
    return h(
      'p',
      { id: 'root' },
      [
        h('div', {}, 'hello, ' + this.msg),
        h(
          SlotComp,
          {},
          // 1/2.插槽中可以包含多个子节点[]vNode或一个子节点vNode
          // h('p', {}, '123')
          // [h('p', {}, '123'), h('p', {}, '456')]

          // 3.具名插槽
          // {
          //   header: h('p', {}, 'header'),
          //   footer: h('p', {}, 'footer')
          // }

          // 4.作用域插槽
          {
              header: ({ age }) => h('p', {}, 'header' + age),
              footer: () => h('p', {}, 'footer')
          }
        )
      ]
    )
  },
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
```

#### 优化
> 因为不是所有的children都需要作为插槽处理，只有当虚拟节点满足 组件类型 和组件的children为 object 时才需要处理  
> 所以在处理组件的children时为组件加上插槽类型的ShapeFlag  
> 创建节点时判断
```js
if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof vNode.children === 'object') {
      vNode.shapeFlag = ShapeFlags.SLOT_CHILDREN
    }
  }
```

### Fragment&Text节点类型
> 在处理插槽的时候，renderSlots拿到是虚拟节点数组，render函数不能直接处理，所以需要使用div将其包裹。  
> 于是renderSlots多渲染了一个div标签，使页面结构与代码不一致。  
> 由此引出Fragment节点类型和Text节点类型  
> Fragment -> 只渲染children  
> Text -> 直接渲染文本，不是vNode

#### 解析
 - Fragment
  > 在patch方法中，目前有区分 element 和 component 类型的节点，而现在需要再新增一个Fragment类型，
  > Fragment类型只渲染vNode的children。  
  > 在渲染插槽的时候，不再用 div 包裹，而是使用Fragment(Symbol) -> processFragment -> 直接mountChildren

 - Text
  > 比如 `header: ({ age }) => [h('p', {}, 'header' + age, '你好呀'])`要渲染两个节点，有一个节点是文本不是vNode  
  > createTextVNode：返回一个特殊的vNode，type是Text  
  > patch新增processText -> 创建文本节点并添加到容器上  
  > 给vNode添加真实节点el属性

### getCurrentInstance
> 通过一个全局变量保存instance，在调用组件的setup方法时更新全局变量。  
> 因此getCurrentInstance只能在setup中使用。

### provide&inject
> 一个组件通过provide来向后代组件传递数据，后代组件可以通过inject获取到祖先组件传递的数据。
- provide - 存
- inject - 取

> 1.基本实现
> 1-1.provide将组件传入的数据保存到当前组件的provides中  
> 1-2.inject取的时候从当前组件的父组件（parent）中取  
> 1-3.处理组件的parent

> 2.跨层级访问  
> 当最后一层组件访问时，中间组件的provides中可能没有数据，于是让这中间组件的provides指向父组件的provides
> （组件的parent可能为空）

> 3.当中间组件有自己的provides时，就会出现错误，设置中间组件的属性时，会把父组件的属性修改了  
> 4.通过原型链实现，将当前组件的provides设置为一个新对象，这个新对象的原型对象是父组件的provides  
> 5-1.因为上一步的操作是一个初始化的操作，当一个组件调用两次provide时，就会覆盖掉上一次的provides，
> 所以这一步只能在初始化的时候执行  
> 5-2.当当前组件的provides等于父组件的provides，说明需要初始化  
> 6-1.inject的默认值，如果key在provides中则返回，否则返回默认值  
> 6-2.也可以传入函数，判断如果是函数则执行并返回结果

### 实现自定义渲染器
> 将运行时里面的具体实现抽离出来，使其不依赖平台。利用vue渲染机制在其他平台上渲染视图，就不能使用`document.createElement`，
> 需要根据具体平台的API来渲染。  
> 让渲染器接收一个配置对象，这个配置对象中包含各种具体的渲染操作。比如创建元素，在配置对象中传入createElement，createElement
> 的实现根据当前平台来决定。

#### renderer.ts
导出一个方法用来创建渲染器，接收一个配置对象
 - createElement
 - patchProp
 - insert

在runtime-dom中创建需要渲染器需要的接口，实现基于DOM的渲染器。

创建createAppAPI，接收render函数，内部返回之前的createApp方法  
createRenderer返回一个对象，包含createApp方法（调用createAppAPI，以render作为参数）  

runtime-dom返回createApp方法，根据已经实现的基于DOM的渲染器，调用它的createApp方法

导出runtime-dom中的内容，在runtime-dom中导出runtime-core
