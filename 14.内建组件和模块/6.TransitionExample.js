/* Transition */

/*
* Transition组件的核心原理：
* 当DOM元素被挂载时，将动效附加到该DOM上
* 当DOM被卸载时，不立即卸载DOMyua尿素，而是等到动效执行完成后再卸载它
* */

const htmlTemplate = `
<div class="box"></div>
`
// 假设为上面元素添加进场动效，从距离左边200px的位置在1s内运动到距左边0px的位置
const cssEnter = `
.box {
  width: 100px;
  height: 100px;
  background-color: red;
}
// 描述初始状态
.enter-from { transform: translateX(200px); }
// 描述结束状态
.enter-to { transform: translateX(0); }
// 初始和结束状态描述完成后，还需要描述运动过程，例如运动时长、运动曲线等
.enter-active { transition: transform 1s ease-in-out;  }
`

/*
* 实现一个过渡效果
*   创建DOM元素
*   将过渡的初始状态和运动过程定义到元素上，即添加 enter-from enter-active 类名
*   将元素添加到页面，即挂载
* */
// 创建class为 box 的DOM元素
const el = document.createElement('div')
el.classList.add('box')

// 在DOM元素被添加到页面之前，将处式状态和运动过程定义到元素上
el.classList.add('enter-from') // 初始状态
el.classList.add('enter-active') // 运动过程

// 将元素添加到页面
document.body.appendChild(el)

/*
* 切换元素的状态 - 需修改
*   这段代码无法按预期执行，因为浏览器会在当前帧绘制DOM元素，最终结果时enter-to的状态
*   为了解决这个问题，需要在下一帧执行状态切换
* */
el.classList.remove('enter-from')
el.classList.add('enter-to')

/*
* 在下一帧切换元素的状态 - 需修改
*   requestAnimationFrame 注册回调会在当前帧执行，除非在其他代码中已经调用了一次
* */
requestAnimationFrame(() => {
  el.classList.remove('enter-from')
  el.classList.add('enter-to')
})

/*
* 嵌套一层变可解决上面的问题 - 需优化
* */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    el.classList.remove('enter-from')
    el.classList.add('enter-to')
  })
})

/*
* 过渡完成后，将 enter-to、enter-active 移除
* */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    el.classList.remove('enter-from')
    el.classList.add('enter-to')

    // 监听 transitionend 事件完成收尾工作
    el.addEventListener('transitionend', () => {
      el.classList.remove('enter-to')
      el.classList.remove('enter-active')
    })
  })
})

/*
* 在创建DOM元素完成后，到把DOM元素添加到body前，整个过程可以视为beforeEnter阶段。
* 把DOM添加到body之后，可以视为enter阶段。
* beforeEnter：添加 enter-from、enter-active累
* enter：在下一帧中移除 enter-from、添加enter-to
* 进场结束：移除 enter-to、enter-active
* */

// 离场与进场类似
const cssLeave = `
// 初始状态
.leave-form { transform: translateX(0); }
// 结束状态
.leave-to { transform: translateX(200px); }
// 过渡过程
.leave-active { transition: transform 2s ease-out; }
`

/*
* 当元素被卸载时，不立即将其卸载，而是等待过渡效果结束后再卸载它
* */
el.addEventListener('click', () => {
  // 将卸载的动作封装到 performRemove 函数中
  const performRemove = () => el.parentNode.removeChild(el)

  // 设置初始状态
  el.classList.add('leave-from')
  el.classList.add('leave-active')

  // 强制reflow：使初始状态生效
  document.body.offsetHeight

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 切换到结束状态
      el.classList.remove('leave-from')
      el.classList.add('leave-to')

      // 监听 transitionend 事件做收尾工作
      el.addEventListener('transitionend', () => {
        el.classList.remove('leave-to')
        el.classList.remove('leave-active')
        // 当过渡完成后，调用 performRemove 将DOM元素移除
        performRemove()
      })
    })
  })
})

