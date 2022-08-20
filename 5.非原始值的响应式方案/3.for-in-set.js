/* 通过has拦截函数实现对in操作符的代理 - 改变属性 */

/*
* 修改属性不会对for-in循环产生影响，因此不需要触发副作用函数重新执行。
* 解决：使用 Object.prototype.hasOwnProperty 检查当前操作的属性是否已经存在于目标对象上，
*   存在：当前操作类型为SET - 修改属性值
*   不存在：当前操作类型为ADD - 添加新属性
*   DELETE - 删除响应式对象的属性同理
* */

function trigger (target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  // 与key相关联的副作用函数添加到effectsToRun中
  effects && effects.forEach(effectFn => {
    effectsToRun.add(effectFn)
  })

  // 只有当前操作类型为 ADD 时，才触发 ITERATE_KEY 相关联的副作用函数重新执行
  if (type === 'ADD') {
    // 取得与 ITERATE_KEY 关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)
    // 与ITERATE_KEY关联的副作用函数添加到effectsToRun中
    iterateEffects && iterateEffects.forEach(effectFn => {
      effectsToRun.add(effectFn)
    })
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
