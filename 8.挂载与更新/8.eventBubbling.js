/* 事件冒泡与更新时机 */

const bol = ref(false)

effect(() => {
  const vNode = {
    type: 'div',
    props: bol.value ? {
      onClick: () => {
        console.log('父元素')
      }
    } : {},
    children: [
      {
        type: 'p',
        props: {
          onClick: () => {
            bol.value = true
          }
        },
        children: 'text'
      }
    ]
  }
  renderer.render(vNode, document.querySelector('#app'))
})
/*
* div元素：它的props对象得值是由一个三元表达式决定得。首次渲染时，由于bol.value得值为false，
*   所以它的值是一个空对象。
* p元素：具有click单击事件，点击它时，处理函数会将bol.value的值设置为true。
*
* 由于bol是一个响应式数据，所以当它的值发生变化时，会触发副作用函数重新执行。所以在更新阶段，渲染器会为父级
*   div元素绑定click事件处理函数。更新完成后，点击事件才从p元素冒泡到腹肌div元素。
*   因此，点击p元素时，div的click事件也会被触发。
* */

/*
* 触发事件的流程
* 点击 p 元素，在这里触发事件
* p 元素的事件处理函数执行
* 副作用函数重新执行
* 渲染器
* 为 div 元素绑定事件
* 事件冒泡到 div 元素
*
* 可以看到事件触发的事件要早于事件处理函数被绑定的事件，屏蔽所有绑定时间晚于时间触发事件的事件处理函数的执行。
* */
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
          // 如果事件发生的时间早于事件处理函数绑定事件，则不执行事件处理函数
          if (e.timeStamp < a.attached) return
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            invoker.value(e)
          }
        }
        invoker.value = nextValue
        // 存储事件处理函数被绑定的时间
        invoker.attached = performance.now()
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
* 添加了 invoker.attached 属性，用来存储时间处理函数被绑定的时间。在 invoker 执行的时候，通过
*   事件对象的 e.timeStamp 获取事件发生的时间。如果时间处理函数被绑定的事件晚于事件发生的时间，
*   则不执行该事件处理函数。
* */
