/* 分支切换与cleanUp - 分支切换 */

const data = { ok: true, text: 'one piece' }

const obj = new Proxy(data, {})

effect(() => {
  document.body.innerText = obj.ok ? obj.text : 'not'
})

/*
* fn与响应式数据之间的联系是这样的
* - data
*   - ok
*     - effectFn
*   - text
*     - effectFn
* */

/*
* 副作用函数被字段 obj.ok 和 obj.text 所对应的依赖集合收集。当字段 obj.ok 的值为false，此时字段 obj.text 不会被读取，
*   只会触发字段 obj.ok 的读取操作，所理理想情况下副作用函数不应该被 obj.text 所对应的依赖集合收集。
*
* 要将一个副作用函数从与之关联的依赖集合中移除，就需要明确知道哪些依赖集合中包含它，因此重新设计副作用函数。
* */

let activeEffect
const bucket = new WeakMap()

// function effect (fn) {
//   const effectFn = () => {
//     cleanup(effectFn) // 新增
//     // 当effectFn执行时，将其设置为当前激活的副作用函数
//     activeEffect = fn
//     fn()
//   }
//   // 存储所有与该副作用函数相关联的依赖集合
//   effectFn.deps = []
//   effectFn()
// }

function cleanup (effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i]
    // 将 effectFn 从依赖集合中删除
    deps.delete(effectFn)
  }
  // 需要重置 effectFn.deps 数组
  effectFn.deps.length = 0
}

function track (target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger (target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set(effects)
  effectsToRun.forEach(fn => fn())
}

/*
* cleanup接收一个副作用函数，遍历副作用函数的 deps 属性，这个属性的每一项都对应一个key的依赖集合，
*   然后将这个副作用函数从所有依赖集合中删除。
* effect先调用cleanup将对应依赖清空，在去执行fn，这样会重新触发响应式对象的get方法，并重新收集依赖。
* 案例流程：
* obj.ok 为true时：先清空依赖，然后执行 fn 重新收集依赖。和之前的流程几乎一样，只是多了一个清空依赖的操作。
* obj.ok 为false时：先清空依赖，再执行fn，这里要注意的是再次执行fn时，副作用函数并没有读取obj.text的值，所以
*   不会为 obj.text 收集依赖。因此 obj.text 再修改的时候，不会重新触发依赖。
* */

const effectStack = []

function effect (fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn)
    fn()
    // 当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}
