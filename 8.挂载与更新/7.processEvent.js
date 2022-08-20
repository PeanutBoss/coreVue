/* 处理事件 - 事件于属性都是保存在props中的，区别在于事件是以 on 开头的 */

// 添加事件处理函数
function patchPropsV1 (el, key, preValue, nextValue) {
  if (/^on/.test(key)) {
    // 根据属性名获取事件名 如：onClick --> click
    const name = key.slice(2).toLowerCase()
    // 绑定事件，nextValue为props中 name 对应的属性值（即事件处理函数）
    el.addEventListener(name, nextValue)
  } else if (key === 'class') {
    el.className = nextValue || ''
  } else if (shouldSetAsProps(el. key, nextValue)) {
    const type = typeof el[key]
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = nextValue
    }
  } else {
    el.setAttribute(key, nextValue)
  }
}

// 更新：先移除之前添加的事件处理函数，再将新的事件处理函数绑定到DOM上
function patchPropsV2 (el, key, preValue, nextValue) {
  if (/^on/.test(key)) {
    // 根据属性名获取事件名 如：onClick --> click
    const name = key.slice(2).toLowerCase()
    // 移除上一次绑定的事件处理函数
    preValue && el.removeEventListener(name, preValue)
    // 绑定新的事件处理函数
    el.addEventListener(name, nextValue)
  } else if (key === 'class') {
    el.className = nextValue || ''
  } else if (shouldSetAsProps(el. key, nextValue)) {
    const type = typeof el[key]
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = nextValue
    }
  } else {
    el.setAttribute(key, nextValue)
  }
}

/*
* 绑定事件是，可以绑定一个伪造的事件处理函数 invoker，然后把真正的事件处理函数设置为 invoker.value 的值。
* */
function patchPropsV3 (el, key, preValue, nextValue) {
  if (/^on/.test(key)) {
    let invoker = el._vei
    // 根据属性名获取事件名 如：onClick --> click
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        // 如果没有 invoker，则将一个伪造的 invoker 缓存到 el._vei 中
        invoker = el._vei = e => {
          // 当伪造的事件处理函数执行时，会执行真正的事件处理函数
          invoker.value(e)
        }
        // 将阵阵的事件处理函数赋值给 invoker.value
        invoker.value = nextValue
        el.addEventListener(name, invoker)
      } else {
        invoker.value = nextValue
      }
    } else if (invoker) {
      el.removeEventListener(name, invoker)
    }
  } else if (key === 'class') {
  } else if (shouldSetAsProps(el, key, nextValue)) {
  } else {}
}

/*
* 如果一个元素同时绑定了多个事件，将会出现事件覆盖
* */
function patchPropsV4 (el, key, preValue, nextValue) {
  if (/^on/.test(key)) {
    const invokers = el._vei || (el._vei = {})
    // 根据事件名获取 invoker
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        // 将事件处理函数缓存到 el._vei[key] 下，避免覆盖
        invoker = el._vei[key] = e => {
          invoker.value(e)
        }
        invoker.value = nextValue
        el.addEventListener(name, invoker)
      } else {
        invoker.value = nextValue
      }
    } else if (invoker) {
      el.removeEventListener(name, invoker)
    }
  } else if (key === 'class') {
  } else if (shouldSetAsProps(el, key, nextValue)) {
  } else {}
}

/*
* 一个元素不仅可以绑定多种类型的事件，对于统一类型的事件，还可以绑定多个事件处理函数。
* */
const vNode = {
  type: 'p',
  props: {
    onClick: [
      () => console.log(1),
      () => console.log(2)
    ]
  }
}
function patchPropsV5 (el, key, preValue, nextValue) {
  if (/^on/.test(key)) {
    const invokers = el._vei || (el._vei = {})
    // 根据事件名获取 invoker
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if (nextValue) {
      if (!invoker) {
        // 将事件处理函数缓存到 el._vei[key] 下，避免覆盖
        invoker = el._vei[key] = e => {
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            invoker.value(e)
          }
        }
        invoker.value = nextValue
        el.addEventListener(name, invoker)
      } else {
        invoker.value = nextValue
      }
    } else if (invoker) {
      el.removeEventListener(name, invoker)
    }
  } else if (key === 'class') {
  } else if (shouldSetAsProps(el, key, nextValue)) {
  } else {}
}
