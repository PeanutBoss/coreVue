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
