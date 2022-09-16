## 快速Diff算法

大家中秋快乐哦~

Diff算法系列文章

* 简单Diff算法：[传送门](https://juejin.cn/post/7139034950598131720)
* 双端Diff算法：[传送门](https://juejin.cn/post/7139386449949884447)

### 预处理

前面讲到简单Diff算法和双端Diff算法，它们使用不一样的对比规则对虚拟节点的 type（元素名）和 虚拟节点的key（唯一标识）来区分是否有可以复用的旧节点。快速Diff算法也是一样的，不过要比简单Diff和双端Diff多了一步预处理的操作。

#### 什么是预处理

什么是预处理呢？用文本来举个例子：

    const TEXT1 = 'I am a front-end developer'
    const TEXT2 = 'I am a back-end developer'

要对这两段文本进行diff，首先会对它进行全等比较：`if (TEXT1 === TEXT2) return`，如果全等旧没有必要进入核心的diff步骤了。除了全等比较，还会对他们进行前缀于后缀的比较。一眼就能看到这两段文本的头部和尾部分别有一段相同的内容。

**I am a** front **-end developer**

**I am a** back **-end developer**

对于相同的内容，不需要进行Diff操作，因此对于 TEXT1 和 TEXT2 来说，真正需要Diff操作的部分是：

    TEXT1：front
    TEXT2：back

这是一种简化问题的方式，好处是可以在特定情况下能够轻松判断文本的插入和删除。

预处理便是将上面的例子掐头去尾的过程，那么再看另外一个例子：

    const TEXT3 = I like you
    const TEXT4 = I like you too

这两段文本经过预处理之后可以得到：

    TEXT3：
    TEXT4：too

如果 TEXT3 是新的内容，那么只需要删除多余的 too 就可以完成文本更新；否则，添加 too 完成文本更新。

#### 预处理要怎么做 - 例一

快速Diff算法就是借鉴了纯文本的diff算法中预处理的步骤。以下面的两组节点为例：

    const oldChildren = [
      { type: 'p', key: '1' },
      { type: 'p', key: '2' },
      { type: 'p', key: '3' }
    ]
    const newChildren = [
      { type: 'p', key: '1' },
      { type: 'p', key: '4' },
      { type: 'p', key: '2' },
      { type: 'p', key: '3' }
    ]


![8cdcc72bc2c8728babaa26a129c50af.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae3c685fa8404e72945c219cdfa96c03~tplv-k3u1fbpfcp-watermark.image?)

从图中可以看到，两组节点具有相同的前置节点 p - 1，以及相同的后置节点 p - 2、p - 3。对于相同的前置节点和后置节点，由于它们在新旧两组子节点中的相对位置不变，所以不需要移动它们，但仍然要在它们之间打补丁。

##### 处理前置节点

对于前置节点，可以建立索引 j ，初始值为0，指向两组子节点的开头。开启一个while循环，让索引 j 递增，直至遇到不同的节点为止。

    function patchKeyedChildren (n1, n2, container) {
      const newChildren = n1.children
      const oldChildren = n2.children
      // 处理相同的前置节点
      // 索引 j 指向新旧两组子节点的开头
      let j = 0
      let oldVNode = oldChildren[j]
      let newVNode = newChildren[j]
      // while 循环向后遍历，直到遇到不同 key 值的节点为止
      while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数进行更新
        patch(oldVNode, newVNode, container)
        // 让索引 j 递增以对下一个节点进行处理
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
      }
    }

上面使用while循环查找所有相同的前置节点，并调用patch函数进行打补丁，直到遇到key值不同的节点为止。这样就完成了对前置节点的预处理。


![3dbd6365e54a152d3ae13d34b30d8ad.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5661f3a5d7904362a306cb62ddc736ed~tplv-k3u1fbpfcp-watermark.image?)

##### 处理后置节点

接下来就要处理后置节点，因为新旧两组子节点的数量不同所以还需要两个索引，指向新旧两组子节点的最后一个节点。然后再开启一个while循环从后向前遍历这两组子节点，直到遇到key值不同的节点为止。

    function patchKeyedChildren (n1, n2, container) {
      const newChildren = n1.children
      const oldChildren = n2.children
      // 处理相同的前置节点
      // 索引 j 指向新旧两组子节点的开头
      let j = 0
      let oldVNode = oldChildren[j]
      let newVNode = newChildren[j]
      // while 循环向后遍历，直到遇到不同 key 值的节点为止
      while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数进行更新
        patch(oldVNode, newVNode, container)
        // 让索引 j 递增以对下一个节点进行处理
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
      }
    
      // 获取最后的子节点的索引值
      let oldEnd = oldChildren.length - 1
      let newEnd = newChildren.length - 1
      // 获取最后的子节点
      oldVNode = oldChildren[oldEnd]
      newVNode = newChildren[newEnd]
      // while 循环从后向前遍历，直至遇到不同 key 值得节点为止
      while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数进行更新
        patch(oldVNode, newVNode, container)
        // 让索引 j 递减以对下一个节点进行处理（因为是从后往前所以递减）
        oldEnd--
        newEnd--
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
      }
    }

与处理相同得前置节点一样，在while循环内，需要调用patch函数进行打补丁，然后递减两个索引oldEnd、newEnd。


![ed496d1288c14350717f77d6197fc0a.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abf23a7a30644326b9e8c8b97d4c0257~tplv-k3u1fbpfcp-watermark.image?)

##### 新增节点

从图中可以看到，相同的前置节点和后置节点被处理完之后，**旧的一组一节点全部被处理了**，而在新的一组子节点中，还有一个没有被处理的节点 p - 4。因此得出，p - 4 是一个新增节点：

`oldEnd < j` 成立，说明在预处理时，所有旧子节点都处理完毕了

`newEnd >= j`成立，说明预处理后，新的一组子节点中，存在未被处理的节点，这些节点就是新增的节点


![989be1efa37b5166046a5bbbd8b867f.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2ebac8dd0eb40f4a1edf54c2b0985b9~tplv-k3u1fbpfcp-watermark.image?)

索引值在 j 和 newEnd 之间的任何节点都需要作为新的子节点进行挂载，挂载新元素就要找到正确的锚点元素。从上图中看到，新增节点应该挂载到节点 p - 2 所对应的真实DOM前面，所以将 p - 2 作为挂载操作的锚点元素。

    function patchKeyedChildren (n1, n2, container) {
    
        // 省略部分代码
    
      // 预处理完毕后，如果满足 j --> newEnd 之间的节点应该作为新节点插入
      if (j > oldEnd && j <= newEnd) {
        // 锚点的索引
        const anchorIndex = newEnd + 1
        // 得到锚点元素
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
        // 将新增的节点逐个挂载
        while (j <= newEnd) {
          patch(null, newChildren[j++], container, anchor)
        }
      }
    }

##### 删除节点 - 例二

看下面的例子：

      const oldChildren = [
        { type: 'p', key: '1' },
        { type: 'p', key: '3' }
      ]
      const newChildren = [
        { type: 'p', key: '1' },
        { type: 'p', key: '2' },
        { type: 'p', key: '3' }
      ]


![6460d7f104b46c17333e217736684d6.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fe5b8b7197f4e20a56682cea0d90097~tplv-k3u1fbpfcp-watermark.image?)

该例进行预处理后的结果为：


![f07cfe2d1ecda0857a8ffa7107d5244.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b433706ca0e412981aa9d92fc04c91b~tplv-k3u1fbpfcp-watermark.image?)

    function patchKeyedChildren (n1, n2, container) {
    
        // 省略部分代码
    
      // 预处理完毕后，如果满足 j --> newEnd 之间的节点应该作为新节点插入
      if (j > oldEnd && j <= newEnd) {
        // 锚点的索引
        const anchorIndex = newEnd + 1
        // 得到锚点元素
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
        // 将新增的节点逐个挂载
        while (j <= newEnd) {
          patch(null, newChildren[j++], container, anchor)
        }
      } else if (j > newEnd && j<= oldEnd) {
        // 有要删除的节点
        while (j <= oldEnd) {
          unmount(oldChildren[j++])
        }
      }
    }

#### 是否需要进行移动操作 - 例三

上面的例子是比较简单的操作，处理预处理，只有挂载和卸载操作。但有时情况会很复杂。

      const oldChildren = [
        { type: 'p', key: '1' },
        { type: 'p', key: '3' },
        { type: 'p', key: '4' },
        { type: 'p', key: '2' },
        { type: 'p', key: '7' },
        { type: 'p', key: '5' }
      ]
      const newChildren = [
        { type: 'p', key: '1' },
        { type: 'p', key: '2' },
        { type: 'p', key: '3' },
        { type: 'p', key: '4' },
        { type: 'p', key: '6' },
        { type: 'p', key: '5' }
      ]


![911d7c6ec8f84a94e042bcaaf482682.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/704ababe293e473e8585e054db944110~tplv-k3u1fbpfcp-watermark.image?)

该例经过预处理后，新的和旧的两组子节点都有部分节点未处理。这个时候就需要进一步操作，看之前的简单Diff和双端Diff可以了解到，它们都遵守同样的处理规则：

* 判断是否有节点需要移动，以及如何移动
  
* 找出那些需要被添加或移除的节点
  

![a5a4af0e27da1bb41d10c7022abff5a.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c15243a97c5b4dc4b64c3e8cddf6bf14~tplv-k3u1fbpfcp-watermark.image?)

快速Diff算法也不例外，接下来的要做的就是判断哪些节点需要移动以及应该如何移动。

从图中可以看到新增`j > oldEnd && j <= newEnd`和删除`j > newEnd && j<= oldEnd`的条件不满足任何一个，所以增加else分支来处理非理想情况。_接下来的内容有一丢丢复杂了哦_

##### 构造source

首先需要构造一个数组 source，它的长度等于新的一组子节点在经过预处理之后剩余未处理节点的数量，并且source中每个元素的初始值都是-1。

![0915e6b1f8d202631e545e3c068ac0c.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb20bc5c55de446cbb982da1fe1e1712~tplv-k3u1fbpfcp-watermark.image?)

通过上图可以看到，source 数组将用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引，后面将会使用它计算出一个最长递增子序列，用于辅助完成DOM移动的操作。

![7ab9fc8eee6ff0c467888aecce3a592.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8717e43bab254410972bd9d7d24be5be~tplv-k3u1fbpfcp-watermark.image?)

source数组构造完成，接下来看看如何填充source数组：

* 新的一组节点中的第一个节点 p - 3 在旧的一组子节点中的索引为2，因此source数组的第一个元素值为2
  
* 新的一组节点中的第二个节点 p - 4 在旧的一组子节点中的索引为3，因此source数组的第二个元素值为3
  
* 新的一组节点中的第三个节点 p - 2 在旧的一组子节点中的索引为1，因此source数组的第三个元素值为1
  
* 新的一组节点中的第四个节点 p - 7 在旧的一组子节点中找不到与之key值相等的节点，所以source数组的第四个元素值仍然为 -1
  

###### 这里提出一个问题，为什么查找时新的一组节点去掉收尾，旧的找的却是全部？

完成source数组的填充

    function patchKeyedChildren (n1, n2, container) {
        // 省略部分代码
      if (j > oldEnd && j <= newEnd) {
        // 省略
      } else if (j > newEnd && j<= oldEnd) {
        // 省略
      } else {
        // j 指向的是未处理的新节点的开头
        // newEnd 指向的是未处理的新节点的末尾
        // 所以 newEnd - j + 1就是剩余未处理的新节点
        const count = newEnd - j + 1
        // 构造一个与未处理的新节点数量相等长度的数组，并用 -1 填充
        const source = new Array(count)
        source.fill(-1)
        // 遍历旧的一组子节点
        for (let i = oldStart; i <= oldEnd; i++) {
          // 获取本次循环用来对比的旧节点
          const oldVNode = oldChildren[i]
          // 遍历新的一组子节点
          for (let k = newStart; k <= newEnd; k++) {
            // 获取本次循环用来对比的新节点
            const newVNode = newChildren[i]
            // 找到具有相同 key 值得可复用节点
            if (oldVNode.key === newVNode.key) {
              // 调用patch进行更新
              patch(oldVNode, newVNode, container)
              // 最后填充 source 数组
              source[k - newStart] = i
            }
          }
        }
      }
    }

两层for循环我觉得有必要说一下：

_上面的两层循环如果可以看懂不需要看这一段，有点啰嗦，防止误导，没看懂的话再结合图看下面内容更直观一些_

* 外层循环的条件：`let i = oldStart; i <= oldEnd; i++`

> i = oldStart 表示外层循环从旧节点列表被预处理之后，剩余节点中的第一个节点开始，`oldChildren[i]` 等于 `oldChildren[oldStart]` 等同于 旧节点列表剩余节点的第一个元素
> 
> i <= oldEnd 表示外层循环从旧节点列表被预处理之后，剩余节点中的最后一个节点结束，最后 i 会递增到等于oldEnd，所以有`oldChildren[i]` 等于 `oldChildren[oldEnd]` 等同于 旧节点列表剩余节点的最后一个元素

* 内层循环的条件：`let k = newStart; k <= newEnd; k++`

> 与外层循环同理

* 填充操作：`source[k - newStart] = i`

> i 指的是当前外层循环中的旧节点对应的索引，因此填充source的时候用 i 作为值
> 
> k 指的是当前内层循环中的新节点对应的索引，初始值未newStart
> 
> 当前的 newEnd 指的是在所有新节点中，最后一个未被处理的节点的索引
> 
> newStart指的是在所有新节点中，第一个未被处理的节点的索引
> 
> 而 k 的最大值是newEnd，newEnd - newStart就是source最后一个元素的索引
> 
> k 的最小值是 newStart，newStart - newStart就是source第一个元素的索引
> 
> 因此用 k - newStart 作为填充source时的索引

##### 构造索引表

索引表的目的更多是为了优化上一步的操作，因为两层for循环，时间复杂度未 O(n1 * n2)，当新旧两组子节点多的时候可能会带来性能问题。因此构造一个索引表，用来存储 节点的key 和 节点位置索引 之间的映射。

    {
        key1: index1,
        key2: index2
    }

索引表的结构是这样，key表示一个vNode的key，这个key的值（index），就是这个key对应的vNode在就节点列表中的索引。

![cf2d768fecce026114bffa833ca3bef.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/335d23e8d4e848a8bd37be5df0ee2bab~tplv-k3u1fbpfcp-watermark.image?)


索引表构造完成之后，拿旧节点的 key 取索引表中查找该节点在新的一组子节点中的位置，找到了对它进行打补丁操作并且记录到source中。

构造索引表的实现（实际上只是优化了构造source的操作）：

    function patchKeyedChildren (n1, n2, container) {
        // 省略部分代码
      if (j > oldEnd && j <= newEnd) {
        // 省略
      } else if (j > newEnd && j<= oldEnd) {
        // 省略
      } else {
        // j 指向的是未处理的新节点的开头
        // newEnd 指向的是未处理的新节点的末尾
        // 所以 newEnd - j + 1就是剩余未处理的新节点
        const count = newEnd - j + 1
        // 构造一个与未处理的新节点数量相等长度的数组，并用 -1 填充
        const source = new Array(count)
        source.fill(-1)
        // oldStart newStart 都指向未处理的新节点列表的起始索引
        const oldStart = j
        const newStart = j
        // 构造索引表
        const keyIndex = {}
        // 循环新节点列表经预处理后剩余的节点
        for (let i = newStart; i <= newEnd; i++) {
          // newChildren[i].key 指的是当前循环的的节点的key属性
          keyIndex[newChildren[i].key] = i
        }
        // 循环旧的一组节点中剩余未处理的节点
        for (let i = oldStart; i <= oldEnd; i++) {
          // 取到当前的旧节点
          oldVNode = oldChildren[i]
          // 通过索引表快速找到新的一组子节点中具有 相同key值 的节点位置
          const k = keyIndex[oldVNode.key]
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k]
            // 调用 patch 完成更新
            patch(oldVNode, newVNode, container)
            // 填充source数组
            source[k - newStart] = i
          } else {
            // 如果没有找到对应索引，说明新节点列表没有该节点，需要卸载
            unmount(oldVNode)
          }
        }
      }
    }

到这里初始化source数组的相关操作已经结束，接下来就应该判断节点是否需要移动（快速Diff算法与简单Diff算法判断是否需要移动的方法很相似）。

根据上面的计算已经可以得出，source的结果是 [2, 3, 1, -1]

##### 是否需要移动

定义一个变量 moved 代表当前节点是否需要移动，pos 代表遍历就得子节点得过程中遇到得最大索引值。**如果在遍历过程中遇到得索引值呈现递增趋势，则说明不需要移动；否则需要移动。** 不明白的话建议看看简单Diff算法（了解以下就能明白了哦）。

[简单diff算法 - 传送门](https://juejin.cn/post/7139034950598131720)

_改动较少，添加注释的代码是新增代码_

    function patchKeyedChildren (n1, n2, container) {
        // 省略部分代码
      if (j > oldEnd && j <= newEnd) {
        // 省略
      } else if (j > newEnd && j<= oldEnd) {
        // 省略
      } else {
        const count = newEnd - j + 1
        const source = new Array(count)
        source.fill(-1)
        const oldStart = j
        const newStart = j
    
        // 新增两个变量
        let moved = false // 是否需要移动
        let pos = 0 // 遍历一组子节点的过程中遇到的最大索引值
    
        const keyIndex = {}
        for (let i = newStart; i <= newEnd; i++) {
          keyIndex[newChildren[i].key] = i
        }
        for (let i = oldStart; i <= oldEnd; i++) {
          oldVNode = oldChildren[i]
          const k = keyIndex[oldVNode.key]
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k]
            patch(oldVNode, newVNode, container)
            source[k - newStart] = i
    
            // 判断节点是否需要移动
            if (k < pos) {
              // pos 代表遍历就得子节点得过程中遇到得最大索引值
              moved = true
            } else {
              // 如果出现大于当前pos的值，则更新pos
              pos = k
            }
    
          } else {
            unmount(oldVNode)
          }
        }
      }
    }

##### 卸载多余节点

添加一个数量表示 patched，表示已经更新过的节点数量。已经更新过的节点数量应该小于等于新的一组子节点中需要更新的节点数量，如果它超过了新的一组子节点中需要更新的节点数量，则说明有多余的节点，应该将它卸载。

    function patchKeyedChildren (n1, n2, container) {
        // 省略部分代码
      if (j > oldEnd && j <= newEnd) {
        // 省略
      } else if (j > newEnd && j<= oldEnd) {
        // 省略
      } else {
        const count = newEnd - j + 1
        const source = new Array(count)
        source.fill(-1)
        const oldStart = j
        const newStart = j
        let moved = false
        let pos = 0
        const keyIndex = {}
        for (let i = newStart; i <= newEnd; i++) {
          keyIndex[newChildren[i].key] = i
        }
    
        // 新增变量 patched，待变更新过的节点数量
        let patched = 0
        for (let i = oldStart; i <= oldEnd; i++) {
          oldVNode = oldChildren[i]
          // 如果更新过的节点数量小于等于需要更新的节点数量。则执行更新
          if (patched <= count) {
            const k = keyIndex[oldVNode.key]
            if (typeof k !== 'undefined') {
              newVNode = newChildren[k]
              patch(oldVNode, newVNode, container)
              // 更新一个节点之后就让它递增
              patched++
              source[k - newStart] = i
              if (k < pos) {
                moved = true
              } else {
                pos = k
              }
            } else {
              unmount(oldVNode)
            }
          } else {
            // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的节点
            unmount(oldVNode)
          }
        }
      }
    }

到这里已经可以通过moved的值，知道了是否需要移动当前循环中的节点。

#### 如何移动元素

还是继续使用上面的例子（例三）

目前为止已经能知道 在遍历预处理之后的节点列表时，哪些节点是需要移动的；并且构造出了source数组，其值为[2, 3, 1, -1]。这些都是为接下来的移动元素操作做铺垫。

_最长递增子序列用来得出不需要移动的节点片段_ 

首先要根据source计算出它的最长递增子序列`seq`（本片主要讲Diff算法，不过多解释：[最长递增子序列 - 传送门](https://juejin.cn/post/7134499769803603999)）

求得的source中，它的最长递增子序列为 [0, 1]

> 解释以下为什么：数组 [2, 3, 1, -1] 中，从开始到结尾递增的元素是 `2, 3`这部分，它们对应的下标是 `0, 1`，所以说它们的最长递增子序列为 [0, 1]，这里说的是最长递增子序列对应的下标，并不是具体的值。

现在已经有了最长递增子序列的信息，为了让子序列与新的索引值产生对应关系，接下来要对节点进行编号。要怎样进行编号呢？看图~

![ea0f7b738a696927979316c4bb55628.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0a488929873418b81e6ec6823813edf~tplv-k3u1fbpfcp-watermark.image?)

新的一组子节点中，重新编号后索引值为 0 和 1 的两个节点在更新前后顺序没有任何变化。即重新编号后，索引值为 0 和 1 的节点不需要移动。在新的一组子节点中，节点 p - 3 的索引为0，节点 p - 4 的索引为1，所以节点 p - 3 和 p - 4 所对应的真实DOM不需要移动。

> 这一步感觉有一点乱，简单解释下：
> 
> 重新编号之前，最长递增子序列对应的是 新节点在旧节点列表中的为止
> 
> 而编号之后，最长递增子序列对应的是 具体的节点

为了完成节点移动，还需要创建两个索引值 i、s

索引 i 指向新的一组子节点中的最后一个节点

索引 s 指向最长递增子序列中的最后一个元素

![5b705c8878e3bd38577aae62e1dd38d.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ba4fd6ce7784af890c5cc2a9827edb1~tplv-k3u1fbpfcp-watermark.image?)

图中可以看到 i 和 s 这两个变量的移动方向

现在就可以开始循环，判断当前循环的节点对应的真实DOM是否需要移动或新增

    // 求最长递增子序列，省略具体实现
    function lis (source) {
      return []
    }
    
    function patchKeyedChildren (n1, n2, container) {
      // 省略部分代码
      if (j > oldEnd && j <= newEnd) {
        // 省略
      } else if (j > newEnd && j<= oldEnd) {
        // 省略
      } else {
        // 省略
        // 这里已经可以直到哪些节点需要移动了
    
        if (moved) {
          // 求得最长递增子序列
          const seq = lis(source)
          // s 指向最长递增子序列的最后一个元素
          let s = seq.length - 1
          // i 指向新的一组节点的最后一个元素
          let i = count - 1
          // for 循环使 i 递减
          for (i; i >= 0; i--) {
            if (source[i] === -1) { // 说明索引为 i 的节点使新的节点，应该将其挂载
              // i + newStart 获取该节点在整个 newChildren 中的索引
              const pos = i + newStart
              const newVNode = newChildren[pos]
              // 以下一个元素作为锚点，取得它的索引
              const nextPos = pos + 1
              const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
              // 挂载操作
              patch(null, newVNode, container, anchor)
            } else if (i !== seq[s]) {
              // 说明该节点需要移动
            } else {
              // 当 i === seq[s] 时，说明该位置节点不需要移动
              // 只需要让 s 指向下一个位置
              s--
            }
          }
        }
      }
    }

看看新增这段代码，根据 moved 判断当前节点是否可能需要移动，如果是：

##### 第一轮循环

* 先判断 `source[i] === -1`，如果该条件成立，则说明该节点是新增节点
  
  * 上述条件不成立则判断 `i !== seq[s]`，如果该条件成立，说明没有遇到最长递增子序列，那么该节点就需要移动
    
  * 上述条件都不成立，那么说明 `i === seq[s]`该条件成立，即遇到了最长递增子序列，那么当前节点就不需要移动，因为是从后向前查找的，所以还需要让 s 递减    

![7c94b064f6032f8bdd9c64764373d19.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17f40850e3a24e09baf98d4d21fd9d51~tplv-k3u1fbpfcp-watermark.image?)

此时已经完成了一次遍历，p - 7 对应的节点已经被处理，再看下一次遍历：

##### 第二轮循环

* 第一步：判断source的值是不是等于 -1，此时索引 i 的值为2，source[2] 的值为1，所以 p - 2 不是全新的节点
  
* 第二步： i !== seq[s] 是否成立，此时索引 i 的值为 2，索引 s 的值为 1。`2 !== seq[1]`成立，所以 p - 2 对应的真实DOM需要移动


![9d79112e9c3e4294538f3cfb14ddb6a.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a87679dd8d949c5bd985f63f0c995f8~tplv-k3u1fbpfcp-watermark.image?)

`

    // 插入节点的实现
    function insert (el, container, anchor) {
        container.insertBefore(el, anchor)
    }
    
    if (moved) {
          const seq = lis(source)
          let s = seq.length - 1
          let i = count - 1
          for (i; i >= 0; i--) {
            if (source[i] === -1) {
              const pos = i + newStart
              const newVNode = newChildren[pos]
              const nextPos = pos + 1
              const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
              patch(null, newVNode, container, anchor)
            } else if (i !== seq[s]) { // 说明该节点需要移动
              // 获取该节点在 newChildren 中的索引
              const pos = i + newStart
              const newVNode = newChildren[pos]
              // 获取锚点元素的索引
              const nextPos = pos + 1
              const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
              // 插入当前节点
              insert(newVNode.el, container, anchor)
            } else {
              s--
            }
          }
        }

可以看到移动节点的实现思路类似于挂载新节点，不同之处在于，移动节点的操作时通过 insert 完成的

##### 第三轮循环

* 第一步：判断source的值是不是等于 -1，此时索引 i 的值为1，source[1] 的值为3，所以 p - 4 不是全新的节点
  
* 第二步： i !== seq[s] 是否成立，此时索引 i 的值为 1，索引 s 的值为 1。`1 !== seq[1]`步成立，所以 p - 2 对应的真实DOM不需要移动
  
* 第三步：前两步都不成立，所以最终会执行 else 分支的代码。以为这 p - 4 对应的真实DOM不需要移动，但是需要让索引 s 的值递减，移动到下一个位置。
  
![7b532d974cb90d18d4fa67f9bbe04bd.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ed895d51af4482fb9642d5b38b5baac~tplv-k3u1fbpfcp-watermark.image?)

##### 第四轮循环

* 第一步：判断source的值是不是等于 -1，此时索引 i 的值为0，source[0] 的值为2，所以 p - 3 不是全新的节点
  
* 第二步：i !== seq[s] 是否成立，此时索引 i 的值为0，索引 s 的值也是0。0 !== seq[0] 不成立
  
* 与上一次循环一样，执行 else 分支的代码，p - 3 对应的真实DOM不需要移动
  

这一轮完成后，循环停止，更新完成。
---

_现在是2022年9月7日21点55分10秒，快放中秋假了，有的人已经收到公司准备的中秋礼品了；还有的人暗示公司发公司礼品了（真的是太放肆了，还问公司要中秋礼品，工资发了就知足吧。）；我就不一样了，我希望公司可以发七月份的工资，我这个要求是不是太过分了。_

---

_现在是2022年9月10日12点42分54秒，已经中秋了，不把这篇文章更完心里不舒服。再次祝节日开心哦。如果哪里有没有讲清楚或者疑惑的地方，可以评论或者私信哦，欢迎打扰。_

---

#### 快速Diff算法完整代码

    function patchKeyedChildren (n1, n2, container) {
      const newChildren = n1.children
      const oldChildren = n2.children
      // 处理相同的前置节点
      // 索引 j 指向新旧两组子节点的开头
      let j = 0
      let oldVNode = oldChildren[j]
      let newVNode = newChildren[j]
      // while 循环向后遍历，直到遇到不同 key 值的节点为止
      while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数进行更新
        patch(oldVNode, newVNode, container)
        // 让索引 j 递增以对下一个节点进行处理
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
      }
    
      // 获取最后的子节点的索引值
      let oldEnd = oldChildren.length - 1
      let newEnd = newChildren.length - 1
      // 获取最后的子节点
      oldVNode = oldChildren[oldEnd]
      newVNode = newChildren[newEnd]
      // while 循环从后向前遍历，直至遇到不同 key 值得节点为止
      while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数进行更新
        patch(oldVNode, newVNode, container)
        // 让索引 j 递减以对下一个节点进行处理（因为是从后往前所以递减）
        oldEnd--
        newEnd--
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
      }
    
      // 预处理完毕后，如果满足 j --> newEnd 之间的节点应该作为新节点插入
      if (j > oldEnd && j <= newEnd) {
        // 锚点的索引
        const anchorIndex = newEnd + 1
        // 得到锚点元素
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
        // 将新增的节点逐个挂载
        while (j <= newEnd) {
          patch(null, newChildren[j++], container, anchor)
        }
      } else if (j > newEnd && j<= oldEnd) {
        // 有要删除的节点
        while (j <= oldEnd) {
          unmount(oldChildren[j++])
        }
      } else {
        // j 指向的是未处理的新节点的开头
        // newEnd 指向的是未处理的新节点的末尾
        // 所以 newEnd - j + 1就是剩余未处理的新节点
        const count = newEnd - j + 1
        // 构造一个与未处理的新节点数量相等长度的数组，并用 -1 填充
        const source = new Array(count)
        source.fill(-1)
    
        // oldStart newStart 都指向未处理的新节点列表的起始索引
        const oldStart = j
        const newStart = j
    
        // 新增两个变量
        let moved = false // 是否需要移动
        let pos = 0 // 遍历一组子节点的过程中遇到的最大索引值
    
        // 构造索引表
        const keyIndex = {}
        // 循环新节点列表经预处理后剩余的节点
        for (let i = newStart; i <= newEnd; i++) {
          // newChildren[i].key 指的是当前循环的的节点的key属性
          keyIndex[newChildren[i].key] = i
        }
    
        // 新增变量 patched，待变更新过的节点数量
        let patched = 0
        // 循环旧的一组节点中剩余未处理的节点
        for (let i = oldStart; i <= oldEnd; i++) {
          // 取到当前的旧节点
          oldVNode = oldChildren[i]
          // 如果更新过的节点数量小于等于需要更新的节点数量。则执行更新
          if (patched <= count) {
            // 通过索引表快速找到新的一组子节点中具有 相同key值 的节点位置
            const k = keyIndex[oldVNode.key]
            if (typeof k !== 'undefined') {
              newVNode = newChildren[k]
              // 调用 patch 完成更新
              patch(oldVNode, newVNode, container)
              // 更新一个节点之后就让它递增
              patched++
              // 填充source数组
              source[k - newStart] = i
              // 判断节点是否需要移动
              if (k < pos) {
                // pos 代表遍历就得子节点得过程中遇到得最大索引值
                moved = true
              } else {
                // 如果出现大于当前pos的值，则更新pos
                pos = k
              }
            } else {
              // 如果没有找到对应索引，说明新节点列表没有该节点，需要卸载
              unmount(oldVNode)
            }
          } else {
            // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的节点
            unmount(oldVNode)
          }
        }
    
        if (moved) {
          // 求得最长递增子序列
          const seq = lis(source)
    
          // s 指向最长递增子序列的最后一个元素
          let s = seq.length - 1
          // i 指向新的一组节点的最后一个元素
          let i = count - 1
          // for 循环使 i 递减
          for (i; i >= 0; i--) {
            if (source[i] === -1) { // 说明索引为 i 的节点使新的节点，应该将其挂载
              // i + newStart 获取该节点在整个 newChildren 中的索引
              const pos = i + newStart
              const newVNode = newChildren[pos]
              // 以下一个元素作为锚点，取得它的索引
              const nextPos = pos + 1
              const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
              // 挂载操作
              patch(null, newVNode, container, anchor)
            } else if (i !== seq[s]) { // 说明该节点需要移动
              // 获取该节点在 newChildren 中的索引
              const pos = i + newStart
              const newVNode = newChildren[pos]
              // 获取锚点元素的索引
              const nextPos = pos + 1
              const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
              // 插入当前节点
              insert(newVNode.el, container, anchor)
            } else {
              // 当 i === seq[s] 时，说明该位置节点不需要移动
              // 只需要让 s 指向下一个位置
              s--
            }
          }
        }
      }
    }