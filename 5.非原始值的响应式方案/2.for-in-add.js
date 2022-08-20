/* 通过has拦截函数实现对in操作符的代理 - 添加属性 */

/*
* 像响应式对象中添加新的属性后，会对for-in循环造成影响，因此需要触发ITERATE_KEY关联的依赖。
* 原因：比如添加bar属性，set接收到的key就是字符串bar，因此触发与 bar 相关联的依赖。但for-in是
*   与ITERATE_KEY之间建立联系，与 bar 并没有关系。
* */

function trigger (target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  // 取得与 ITERATE_KEY 关联的副作用函数
  const iterateEffects = depsMap.get(ITERATE_KEY)

  const effectsToRun = new Set()
  // 与key相关联的副作用函数添加到effectsToRun中
  effects && effects.forEach(effectFn => {
    effectsToRun.add(effectFn)
  })
  // 与ITERATE_KEY关联的副作用函数添加到effectsToRun中
  iterateEffects && iterateEffects.forEach(effectFn => {
    effectsToRun.add(effectFn)
  })

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
/*
* 当trigger函数执行时，除了把直接与具体操作的key关联的副作用函数取出来执行外，还把与ITERATE_KEY
*   关联的副作用函数取出来执行。
* */
