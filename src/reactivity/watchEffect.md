## watchEffect

> 与响应式系统中的effect不同，`effect`在数据发生变化后立即执行；`watchEffect`默认在组件渲染之前执行。
> 与Vue的运行时强相关的，只能在Vue中使用（响应式系统中的effect可以在其他地方使用）。

### 功能点
 - 接收副作用函数，当函数中的响应式对象发生改变，在组件渲染之前重新执行副作用函数
 - 返回一个stopHandler，调用stopHandler会清空之前收集的依赖
 - onCleanup，会在下一次执行副作用函数之前进行调用（可以做一些取消的操作）
