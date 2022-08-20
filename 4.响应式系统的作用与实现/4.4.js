/* 分支切换与cleanUp - base */

// effect(() => {
//   document.body.innerText = pirate.name
// })

/*
* 上面的代码中存在三个角色：
*   - 被操作的代理对象 pirate
*   - 被操作的字段名 name
*   - 使用effect函数注册的副作用函数（匿名函数：这里称为effectFn）
* */

/*
* 用target表示一个代理对象所代理的原始对象，key表示被操作的字段名，effectFn代表被注册的副作用函数，
*   如果有两个副作用函数同时读取同一个对象的属性，那么它们可以建立以下关系：
*   - target
*     - key
*       - effectFn1
*       - effectFn2
*   如果同一个副作用函数同时读取同一个对象的属性，那么它们可以建立以下关系：
*   - target
*     - key1
*       - effectFn
*     - key2
*       - effectFn
*   如果不同的副作用函数读取不同对象的不同属性，可以建立以下关系：
*   - target1
*     - key1
*       - effectFn1
*   - target2
*     - key2
*       - effectFn2
* */

// 存储副作用函数的容器
/*
* 为了便于理解，举个例子描述一下 bucket 的结构
* { // 最外层的就是 bucket
*   target1: { // 一个Map对象，用来保存它所有 key 和 key对应的依赖集合
*     key1: [], // 一个Set对象，用来保存一个 key 对应的所有依赖
*     key2: []
*   },
*   target2: {...},
*   ...
* }
* */
const bucket = new WeakMap()

let activeEffect

const obj = new Proxy({}, {
  get(target, key) {
    if (!activeEffect) return
    // 获取一个对象下保存 所有key对应的依赖集合 的Map：如{ key1: deps, key2: deps }
    let depsMap = bucket.get(target)
    if (!depsMap) { // 如果不存在
      depsMap = new Map() // 新建一个
      bucket.set(target, depsMap) // 并保存起来
    }

    // 获取对象下某个key对应的依赖集合
    let deps = depsMap.get(key)
    if (!deps) { // 如果不存在
      deps = new Set() // 新建一个
      deps.set(key, deps) // 并保存起来
    }

    // 将当前激活的副作用函数添加到依赖集合中
    deps.add(activeEffect)
  },
  set(target, key, value) {
    // 设置属性值
    target[key] = value
    // 取出target对应的depsMap
    const depsMap = bucket.get(target)
    // 取出key对应的依赖集合，如果没有直接return，因为没有依赖项
    if (!depsMap) return
    // 根据 key 取得所有副作用函数
    const deps = depsMap.get(key)
    // 执行所有依赖的副作用函数
    deps && deps.forEach(fn => fn())
  }
})
