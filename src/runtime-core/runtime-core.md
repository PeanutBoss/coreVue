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

#### 重构-componentPublicInstance
 - PublicInstanceHandlers = proxy
 - publicPropertiesMap = {}
