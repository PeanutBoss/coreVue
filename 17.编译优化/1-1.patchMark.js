/* 补丁标志 */

/*
* 传统Diff算法无法力用编译时提取到的任何关键信息，这导致渲染器在运行时不可能去做相关优化
* 只要运行时能够区分动态和静态内容，就能实现极致的优化策略
* */

/*
* patchFlag
* 1：动态的textContent
* 2：动态的class绑定
* 3：动态的style绑定
* 4：其他
* */

const template = `
  <div>
    <div>fpp</div>
    <p>{{ bar }}</p>
  </div>
`
// 传统虚拟DOM
const vNode1 = {
  tag: 'div',
  children: [
    { tag: 'div', children: 'foo' },
    { tag: 'p', children: ctx.bar }
  ]
}
// 标记动态节点
const vNode2 = {
  tag: 'div',
  children: [
    { tag: 'div', children: 'foo' },
    { tag: 'p', children: ctx.bar, patchFlag: 1 } // 这是动态节点
  ]
}

const PatchFlag = {
  TEXT: 1,
  CLASS: 2,
  STYLE: 3,
  // 其他...
}

// 可以在虚拟节点的创建阶段，把它的动态子节点提取出来，并将其存储到该虚拟节点的 dynamicChildren 数组内

const vNode3 = {
  tag: 'div',
  children: [
    { tag: 'div', children: 'foo' },
    { tag: 'p', children: ctx.bar, patchFlag: PatchFlag.TEXT }
  ],
  dynamicChildren: [
    // p标签具有 patchFlag属性，因此它是动态节点
    { tag: 'p', children: ctx.bar, patchFlag: PatchFlag.TEXT }
  ]
}

/*
* 一个Block不仅能够收集它的直接动态子节点，还能够收集所有动态子代节点
* 渲染器的更新操作回一Block为维度
* 所有模板的根节点都会是一个Block节点
* */

