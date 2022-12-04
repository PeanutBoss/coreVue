### MVVM

> MVVM是一种软件框架模式，也是一种简化用户界面的事建驱动编程方式。  
> MVVM的核心时数据驱动，即ViewModal，ViewModal时View和Modal的关系映射。ViewModal是一个值转换器，负责转换Modal的
>   数据对象，使数据变得更加易于管理和使用。在MVVM中View和Modal是不可以直接进行通信的，他们存在着ViewModal这个中介，充当观察者的角色。  
> MVVM模式最核心的特性就是数据双向绑定，当用户操作View时，ViewModal感知到变化，然后通知Modal发生了相应改变；反之，Modal发生了改变，
>   ViewModal感知到变化，然后通知View进行更新。ViewModal向上与View进行双向数据绑定，向下与Modal通过接口请求进行数据交互，承上启下
>   的作用。  
> 核心里面时通过声明式的数据绑定实现View的分离，完全解耦View。
