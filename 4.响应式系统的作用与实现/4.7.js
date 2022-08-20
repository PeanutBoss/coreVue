/* 嵌套的effect */

function effect () {
  // 省略
}

const data = { foo: true, bar: true }
const obj = new Proxy(data, {
  // ...
})

let temp1, temp2

effect(function effectFn1 () {
  console.log('effectFn1 执行')
  effect(function effectFn2 () {
    console.log('effectFn2 执行')
    temp2 = obj.bar
  })
  temp1 = obj.foo
})
/*
* effectFn1 内部嵌套了 effectFn2，effectFn1的执行会导致effectFn2的执行。再effectFn2中
*   读取了字段obj.bar，在effectFn1中读取了字段obj.foo，并且effectFn2执行先于字段 obj.foo 的读取操作
* data
*   - foo
*     - effectFn1
*   - bar
*     - effectFn2
* */

/*
* 这种情况下，希望修改 obj.foo 时会触发effectFn1执行。由于effectFn2嵌套在effectFn1里，所以会建姐触发effectFn2，
*   当修改obj.bar时，只会触发effectFn2执行。但结果却不是这样。
*
* 实际上第一次输出了“effectFn1 执行”，后面两次输出了“effectFn2 执行”。
*
* 副作用函数发生嵌套式，内层副作用函数的执行覆盖了activeEffect的值。并且永远不会恢复到原来的值。
*   如果再有响应式数据进行依赖收集，即使这个响应式数据在外层副作用函数中读取的，它们收集到的副作用函数也都式指向
*   内层副作用函数，所以有了这个问题。
* */
