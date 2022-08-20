/* 文本节点、注释节点和Fragment */

/*
* 文本节点不和注释节点不同于普通节点，它们没有标签名称，所以需要创造一些唯一标识，
*   作为注释节点和文本节点的type属性值。
* */
const Text = Symbol()
const Comment = Symbol()
const textVNode = {
  type: Text,
  children: '文本内容'
}
const commentVNode = {
  type: Comment,
  children: '注释内容'
}

function patch (oldV, newV, container) {
  if (oldV && oldV.type !== newV.type) {
    unmount(oldV)
    oldV = null
  }
  const { type } = newV
  if (typeof type === 'string') {
  } else if (type === Text) {
    // 如果没有子节点则进行挂载
    if (!oldV) {
      const el = newV.el = document.createTextNode(newV.children)
      insert(el, container)
    } else {
      // 如果旧vNode存在,只需要替换内容
      const el = newV.el = oldV.el
      if (newV.children !== oldV.children) {
        el.nodeValue = newV.children
      }
    }
  }
}

/*
* 抽离 - 不依赖平台
* */
const parameters = {
  createElement(tag) {},
  setElementText(el, text) {},
  insert(el, parent, anchor) {},
  createText(text) {
    return document.createTextNode(text)
  },
  setText(el, text) {
    el.nodeValue = text
  },
  patchProps (el, key, preValue, nextValue) {}
}
const renderer = createRenderer(parameters)

function patchV1 (oldV, newV, container) {
  if (oldV && oldV.type !== newV.type) {
    unmount(oldV)
    oldV = null
  }
  const { type } = newV
  if (typeof type === 'string') {
  } else if (type === Text) {
    // 如果没有子节点则进行挂载
    if (!oldV) {
      const el = newV.el = createText(newV.children)
      insert(el, container)
    } else {
      // 如果旧vNode存在,只需要替换内容
      const el = newV.el = oldV.el
      if (newV.children !== oldV.children) {
        setText(el, newV.children)
      }
    }
  }
}

/*
* Fragment
*   与文本节点和注释节点类似，片段没有所谓标签名称，因此我们也需要为片段创建标识 - Fragment。
*     它的children存储的内容就是模板中的所有根节点。
*   由于Fragment本身并不会渲染任何内容，所以渲染器只会渲染Fragment的子节点。
* */
const Fragment = Symbol()
const fragmentVNode = {
  type, Fragment,
  children: [
    { type: 'li', children: 'text 1' },
    { type: 'li', children: 'text 2' },
    { type: 'li', children: 'text 3' }
  ]
}

function patchV2 (oldV, newV, container) {
  if (oldV && oldV.type !== newV.type) {
    unmount(oldV)
    oldV = null
  }
  const { type } = newV
  if (typeof type === 'string') {
  } else if (type === Text) {
    // 如果没有子节点则进行挂载
    if (!oldV) {
      const el = newV.el = createText(newV.children)
      insert(el, container)
    } else {
      // 如果旧vNode存在,只需要替换内容
      const el = newV.el = oldV.el
      if (newV.children !== oldV.children) {
        setText(el, newV.children)
      }
    }
  } else if (type === Fragment) {
    if (!oldV) {
      // 如果旧vNode不存在，只需要将片段的children逐个挂载即可
      newV.children.forEach(c => patch(null, c, container))
    } else {
      patchChildren(oldV, newV, container)
    }
  }
}

function unmount (vNode) {
  // 卸载时，如果卸载的 vNode 类型为 Fragment，则需要卸载其children
  if (vNode.type === Fragment) {
    vNode.children.forEach(c => unmount(c))
    return
  }
  // 省略
}
