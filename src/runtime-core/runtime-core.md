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
n1 | n2 = '0000 0101'
n1 & n2 = '0000 0001'
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
