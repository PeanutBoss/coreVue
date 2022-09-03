## 简单Diff算法

_核心Diff只关心新旧虚拟节点都存在一组子节点的情况_

### 减少DOM操作

#### 例子

```javascript
// 旧节点
const oldVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ]
}
// 新节点
const newVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '4' },
    { type: 'p', children: '5' },
    { type: 'p', children: '6' }
  ]
}
```

![dc757a36ca3722a1a28e0e12338a42f.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9afcba3d43024c8c99e4858fa9bd5bb4~tplv-k3u1fbpfcp-watermark.image?)
如果直接去操作DOM，那么上面的更新需要6次DOM操作，卸载所有旧子节点，挂载所有新子节点。

但是观察上面新旧vNode的子节点可以发现：

- 更新前后所有子节点都是 p 标签，即标签元素步变

- 只有p标签的子节点发生变化了

所以最理想的更新方式是直接更新这个p标签的文本节点的内容，这样只需要一次DOM操作，即可完成一个p标签的更新。更新完所有节点只需要3次DOM操作就可以完成全部节点的更新。


上面的做法可以减少DOM操作次数，但问题也很明显，只有节点数量相同这个做法才能正常工作。但新旧两组子节点数量未必相同。  


![639c5a0e184d62352fc2e3c8bce4aff.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eaf76a121f764747ab091f460fd3a0d8~tplv-k3u1fbpfcp-watermark.image?)
新的一组子节点数量少于旧的一组子节点的数量时，意味着有节点在更新后应该被卸载。（图二）

![f4c058c1d36216c42376f605899d1c6.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61fb686ca1244ee5b6bfcb33532d3bfc~tplv-k3u1fbpfcp-watermark.image?)
新的一组子节点数量多余旧的一组子节点的数量时，意味着有节点在更新后应该被新增并挂载。（图三）

#### 结论

通过上面分析得出，进行新旧两组子节点的更新时，不应该总是遍历旧的一组子节点或新的一组子节点，而是应该遍历其中较短的一组。这样才能尽可能多的调用patch进行更新。接着对比新旧两组子节点的长度，如果新的一组子节点更长，说明有新节点需要挂载，否则说明有旧的子节点需要卸载。

#### 实现

```javascript
function easyDiff (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 获取新旧子节点列表的长度
  const oldLen = oldChildren.length
  const newLen = newChildren.length
  // 取得较小的一个（可以理解为两组子节点的公共长度）
  const commonLength = Math.min(oldLen, newLen)
  // 遍历 commonLength 次
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], container)
  }
  // 如果 newLen > oldLen，说明有新子节点需要挂载
  if (newLen > oldLen) {
    for (let i = commonLength; i < newLen; i++) {
      patch(null, newChildren[i], container)
    }
  }
  // 如果 oldLen > newLen，说明有旧节点需要卸载
  if (oldLen > newLen) {
    for (let i = commonLength; i < oldLen; i++) {
      unmount(oldChildren[i])
    }
  }
}
```

### DOM复用与key的作用

#### 例子

_上面通过减少DOM操作次数提升了更新性能，但还存在可优化空间_

```javascript
const KEY = {
  oldVNode: [
    { type: 'p' },
    { type: 'div' },
    { type: 'span' }
  ],
  newVNode: [
    { type: 'span' },
    { type: 'p' },
    { type: 'div' }
  ]
}
```

针对这个例子，如果还使用上面的算法，则需要6次DOM操作。

> 调用 patch 在 p标签和span标签之间打补丁，由于不是相同标签，所以p标签被卸载，然后挂载span标签，需要两步操作，div - p，span - div同理。

很容易发现新旧两组子节点只是顺序不同。所以最优的处理方式是，通过DOM的移动来完成子节点的更新，这比不断执行卸载和挂载性能好得多。但是要通过移动DOM来完成更新，必须要保证新旧两组子节点的确存在可复用的节点。（如果新的子节点没有在旧的子节点中出现，则无法通过移动节点的方式完成更新操作。）

用上面的例子来说，怎么确定新的一组节点中的第三个节点 { type: 'div' } 与旧的一组子节点中的第二个节点相同呢？可以通过`vNode.type`判断，但这种方式并不可靠。

```javascript
  oldChildren: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ],
  newChildren: [
    { type: 'p', children: '3' },
    { type: 'p', children: '1' },
    { type: 'p', children: '2' }
  ]
```

观察上面节点，可以发现，这个案例可以通过移动DOM的方式来完成更新，但是vNode.type的值都相同，导致无法确定新旧节点中的对应关系，就不能确定怎么移动DOM完成更新。

#### 虚拟节点的key

因此，需要引入额外的 `key` 作为vNode的标识。

```javascript
const KEY = {
  oldChildren: [
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' },
    { type: 'p', children: '3', key: '3' }
  ],
  newChildren: [
    { type: 'p', children: '3', key: '3' },
    { type: 'p', children: '1', key: '1' },
    { type: 'p', children: '2', key: '2' }
  ]
}
```

key 属性就像虚拟DOM的 身份证号，只要两个虚拟节点的type和key属性都相同，那么就可以认为它们是相同的；即可以进行DOM的复用。

![1815f529ce336f501b5e92abf15e458.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d22af718404431ebfabb9da946f0d99~tplv-k3u1fbpfcp-watermark.image?)

**但是DOM可复用并不意味着不需要更新**

```javascript
oldVNode: { type: 'p', children: 'text - 1', key: '1' }
newVNode: { type: 'p', children: 'text - 2', key: '1' }
```

两个节点有相同的key可type，但它们的文本内容不同，还是需要通过patch进行打补丁操作。

#### 实现

```javascript
function easyDiffV2 (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 遍历新的children
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren.length; j++) {
      const oldVNode = oldChildren[i]
      // 如果找到可复用的两个节点
      if (newVNode.key === oldVNode.key) {
        // 对可复用的两个节点打补丁
        patch(oldVNode, newVNode, container)
        // 一个新节点处理完后开始下一个新节点
        break
      }
    }
  }
}
```

> 外层循环遍历新的一组子节点，内层循环遍历旧的一组子节点。内层循环中对比新旧子节点的key值，在旧的子节点中找到可以复用的节点；一旦找到则调用 patch 打补丁。

### 找到需要移动的元素

_现在已经可以通过key找到可复用的节点了，接下来要做的是判断一个节点是否需要移动_

#### 探索节点顺序关系

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8724918f84c402cacbfc6ddc94e1cf2~tplv-k3u1fbpfcp-watermark.image?)

节点顺序不变 - 查找过程：

> 第一步：取新的一组子节点中的第一个节点 p - 1，它的key为1，在旧的一组子节点中找到具有相同key值的可复用节点，能够找到，并且该节点在旧的一组子节点中索引为0；p - 2、p = 3同理。

* key 为 1 的节点在 旧节点列表中的索引为0

* key 为 2 的节点在 旧节点列表中的索引为1

* key 为 3 的节点在 旧节点列表中的索引为2

每一次查找可复用节点都会记录该可复用节点在旧的一组子节点中的位置索引，如果按照先后顺序排列，则可以得到一个序列：0、1、2，是一个递增序列。


![2e30cab253f43a575400f0b847d57af.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/220dddc638f349c8b6ca99490e67ed3f~tplv-k3u1fbpfcp-watermark.image?)
节点顺序变化 - 查找过程

> 第一步：取新的一组子节点中的第一个节点 p - 3，它的key为3，在旧的一组子节点中找到具有相同key值的可复用节点，能够找到，并且该节点在旧的一组子节点中索引为2；
> 
> 第二步：取新的一组子节点中的第一个节点 p - 1，它的key为1，在旧的一组子节点中找到具有相同key值的可复用节点，能够找到，并且该节点在旧的一组子节点中索引为0；
> 
> 到了这一步发现递增的顺序被打破了。节点 p - 1 在旧的一组children 的索引为0，它小于 p - 3 在旧children中的索引2.这说明节点 p - 1 在旧children中排在 p - 3前面，但在新的children中，它排在节点 p - 3后面。因此得出：**节点p - 1对应的真实DOM需要移动**
> 
> 第三步：取新的一组子节点中的第一个节点 p - 2，它的key为2，在旧的一组子节点中找到具有相同key值的可复用节点，能够找到，并且该节点在旧的一组子节点中索引为1；
> 
> 节点 p - 2 在旧的一组children 的索引为0，它小于 p - 3 在旧children中的索引2.这说明节点 p - 2 在旧children中排在 p - 3前面，但在新的children中，它排在节点 p - 3后面。因此得出：**节点p - 2对应的真实DOM需要移动

**可以将节点 p - 3 在旧children中的索引定义为：在旧children中寻找具有相同key值节点的过程中，遇到的最大索引值**

如果后续寻找过程中，存在比当前遇到的最大索引值还要小的节点，则意味着该节点需要移动。

#### 实现

```javascript
function easyBigIndex (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
  }
}
```

### 如何移动元素

移动节点指的是，移动一个虚拟节点所对应的真实DOM节点，并不是移动虚拟节点本身。既然移动的是真实DOM节点，就需要取得它的引用，其对应的真实DOM节点会存储到它的`vNode.el`属性中

#### 例子

引用上面的案例：

> 取新的一组子节点中的第一个节点 p - 3，它的key 为3，在旧的虚拟节点列表中找到具有相同 key 值的可复用节点。发现能够找到，并且该节点在旧的一组子节点中的素引为2。此时变量 lastIndex 的值为 0，索引2 不小于0，所以节点 p - 3对应的真实DOM 不需要移动，但需要更新变量 lastIndex 的值为 2。
> 
> 第二步：取新的一组子节点中第二个节点 p - 1，它的key 为1，在旧的一组子节点中找到具有相同 key 值的可复用节点。发现能够找到，并且该节点在日的一组子节点中的索引为0。此时变量 lastIndex 的值为 2，索引0小于 2，所以节点p-1对应的真实 DOM需要移动
> 
> 到了这一步，我们发现，节点p - 1对应的真实 DOM 需要移动，但应该移动到哪里呢？新children 的顺序其实就是更新后真实 DOM 节点应有的顺序。所以节点 p-1在新 children 中的位置就代表了真实 DOM 更新后的位置。由于节点 p - 1在新 children 中排在节点p - 3后面，所以我们应该把节点p - 1所对应的真实 DOM移动到节点p - 3所对应的真实 DOM 后面。这样操作之后，此时真实 DOM 的顺序为 p-2、p-3、p-1。
> 
> 第三步：取新的一组子节点中第三个节点 p-2，它的key 为2。尝试在旧的一组子节点中找到具有相同 key 值的可复用节点。发现能够找到，并且该节点在旧的一组子节点中的素引为1。此时变量 lastIndex 的值为 2，索引1小于2，所以节点p-2对应的真实 DOM需要移动

第二步操作完成后   新 / 旧 / 虚拟   节点之间的对应关系


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e882d26c63054bbebab9c63e3d51585c~tplv-k3u1fbpfcp-watermark.image?)

#### 实现

```javascript
function easyMove (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
  }
}
```

### 添加新元素

#### 例子

在新的一组子节点中，多出来一个 p - 4，它的key值为4，该节点在旧的一组字节点中不存在，因此应该将其视为新增节点。对于新增节点，更新时应该正确地将其挂载：

- 找到新增节点

- 将新增节点挂载到正确位置


> 第一步：取新的一组子节点中第一个节点p - 3，它的key值为3，在旧的一组子节及中找到可复用的节点。发现能找到，并且该节点在旧的一组子节点中的索引值为2。此时，变量lastIndex的值为0，所以节点 p - 3 对应的真实 DOM 不需要移动，但是需要将变量 lastIndex 的值更新为 2。
> 
> 第二步：取新的一组子节点中第一个节点p - 1，它的key值为1，在旧的一组子节及中找到可复用的节点。发现能找到，并且该节点在旧的一组子节点中的索引值为1。此时变量lastIndex的值为2，所以节点 p - 1对应的真实DOM需要移动，并且应该移动到节点 p - 3对应的真实DOM后面。
> 
> 第三步：取新的一组子节点中第一个节点p - 4，它的key值为4，在旧的一组子节及中找到可复用的节点。没有key值为4的节点，因此渲染器会把节点 p - 4 看作新增节点并挂载它。应该挂载到什么地方呢？观察p - 4在新的一组子节点中的位置。由于 p - 4出现在节点 p - 1后面，所以应该把 p - 4 挂载到节点  p - 1 对应的真实DOM后面。
> 
> 
> 
> 第四步：取新的一组子节点中第一个节点p - 2，它的key值为2，在旧的一组子节及中找到可复用的节点。发现能找到，并且该节点在旧的一组子节点中的索引值为1。此时，变量lastIndex的值为2，索引值1小于lastIndex的值2，所以节点 p - 2对应的真实DOM需要移动，并且应该移动到节点 p - 4对应的真实DOM后面。

第二步操作完成后的节点对应关系

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef16754c35b649ee8632ed0378ef8f6c~tplv-k3u1fbpfcp-watermark.image?)
第三步操作完成后的节点对应关系
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/930320f9834f4a89b5be8e7926cce15f~tplv-k3u1fbpfcp-watermark.image?)
#### 实现

```javascript
function easyMount (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]

    // 定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，初始值为false - 没找到
    let find = false
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        // 一旦找到可复用的节点，将变量find设置为true
        find = true
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
    // 这里find如果还是false，说明当前newVNode没有在旧的一组子节点中找到可复用的节点
    // 也就是说当前 newVNode 是新增节点，需要挂载
    if (!find) {
      // 为了将节点挂载到正确位置，需要先获取锚点元素
      // 首先获取当前newVNode的前一个vNode节点
      const prevVNode = newChildren[i - 1]
      let anchor = null
      if (prevVNode) {
        // 如果有前一个vNode节点，则使用它的下一个兄弟节点作为锚点元素
        anchor = prevVNode.el.nextSibling
      } else {
        // 如果没有前一个vNode节点，说明即将挂载的新节点是第一个子节点
        // 这是使用容器元素的firstChild作为锚点
        anchor = container.firstChild
      }
      // 挂载 newVNode
      patch(null, newVNode, container, anchor)
    }
  }
}
```

### 移除不存在的元素

#### 例子

在新的一组节点中，节点 p - 2 不存在了，说明该节点被删除，渲染器应该能找到那些需要删除的节点并正确地将其删除。

找到需要删除的节点 - 步骤：

> 第一步：取新的一组子节点中的第一个节点p - 3，它的key 值为3，在旧的一组子节点中寻找可复用的节点。发现能够找到，并且该节点在旧的一组子节点中的索引值为2。此时变量 lastIndex 的值为0，索引2不小于lastIndex 的值0，所以节点p - 3对应的真实 DOM 不需要移动，但需要更新变量 lastIndex 的值为 2。
> 
> 
> 第二步：取新的一组子节点中的第二个节点 p - 1，它的key 值为1。尝试在旧的一组子节点中寻找可复用的节点。发现能够找到，并且该节点在旧的一组子节点中的索引值为0。此时变量 lastIndex 的值为2，索引0小于 lastIndex 的值 2，
> 所以节点p-1对应的真实 DOM需要移动，并且应该移动到节点p-3对应的真实 DOM 后面经过这一步的移动操作后，发现 p - 3和p - 1都有了对应的真实DOM节点。
> 
> 
> 
> 至此更新结束，但 p - 2 对应的真实DOM仍然存在，所以需要增加额外的逻辑来删除遗留节点。当基本的更新结束时，需要遍历旧的一组子节点，然后去新的一组子节点中寻找具有相同key值的节点。如果找不到，说明应该删除该节点。

p - 2与任何newVNode没有对应关系
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7244c977932348cf8235dfed6387bf94~tplv-k3u1fbpfcp-watermark.image?)

#### 实现

```javascript
function easyUnmount (n1, n2, container) {
  // 取出新旧子节点列表
  const oldChildren = n1.children
  const newChildren = n2.children
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]

    // 定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，初始值为false - 没找到
    let find = false
    for (let j = 0; j < oldChildren; j++) {
      const oldVNode = oldChildren[j]
      if (newVNode.key === oldVNode.key) {
        // 一旦找到可复用的节点，将变量find设置为true
        find = true
        patch(oldVNode, newVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // 获取当前vNode的前一个vNode
          const prevVNode = newChildren[i - 1]
          // 如果 prevVNode 不存在，说明当前vNode是第一个节点，它不需要移动
          if (prevVNode) {
            // 由于要将newVNode对用的真实DOM移动到prevVNode对应的真实DOM后面，
            // 所以需要获取prevVNode对应的真实节点的下一个兄弟节点，并将其作为锚点
            const anchor = prevVNode.el.nextSibling
            // 调用insert将newVNode对应真实DOM插入到锚点元素前面
            // insert 是通过 el.insertBefore 插入元素的
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex的值（lastIndex要保持当前已查找的索引中的最大值）
          lastIndex = j
        }
        break
      }
    }
    // 这里find如果还是false，说明当前newVNode没有在旧的一组子节点中找到可复用的节点
    // 也就是说当前 newVNode 是新增节点，需要挂载
    if (!find) {
      // 为了将节点挂载到正确位置，需要先获取锚点元素
      // 首先获取当前newVNode的前一个vNode节点
      const prevVNode = newChildren[i - 1]
      let anchor = null
      if (prevVNode) {
        // 如果有前一个vNode节点，则使用它的下一个兄弟节点作为锚点元素
        anchor = prevVNode.el.nextSibling
      } else {
        // 如果没有前一个vNode节点，说明即将挂载的新节点是第一个子节点
        // 这是使用容器元素的firstChild作为锚点
        anchor = container.firstChild
      }
      // 挂载 newVNode
      patch(null, newVNode, anchor)
    }
  }

  // 更新操作完成后，遍历旧的一组子节点
  for (let i = 0; i < oldChildren.length; i++) {
    const oldVNode = oldChildren[i]
    // 拿旧子节点oldVNode去新的一组子节点中寻找具有相同key值的节点
    const has = newChildren.find(
      vNode => vNode.key === oldVNode.key
    )
    if (has) {
      // 如果没找到具有相同key值的节点，则说明需要删除该节点，调用unmount函数将其卸载
      unmount(oldVNode)
    }
  }
}

```

### 总结

遍历新旧子结点中较少的一组，逐个调用patch进行打补丁，然后比较新旧两组子节点的数量，如果新的一组子节点数量更多，说明有新节点需要挂载；否则说明在旧的一组子节点中，有节点需要卸载。

引入key属性，就像虚拟节点的身份证号，通过key找到可复用的节点，然后尽可能通过DOM移动操作来完成更新，避免过多地对DOM元素进行销毁和重建。

简单Diff算法地核心逻辑是，拿新的一组子节点中地节点去旧的一组子节点中寻找可复用地节点，如果找到了，则记录该节点地位置索引。在整个更新过程中，如果一个节点地索引值小于最大索引，则说明该节点对应地真实DOM元素需要移动。


