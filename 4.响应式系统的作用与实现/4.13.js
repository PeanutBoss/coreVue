/* watch - base */

// 硬编码版本
function watchHard (source, cb) {
  effect(
    // 触发读取操作，从而建立联系
    () => source.foo,
    {
      scheduler () {
        cb() // 数据发生变化时，调用回调函数
      }
    }
  )
}

/*
* 上面使用硬编码的方式进行读取操作，只能观测到 obj.foo 的变化
* 为了让 watch 具有通用性，需要封装一个通用的读取操作
* */

function traverse (value, seen = new Set()) {
  // 如果要读取的数据是原始值或者已经读取过了，那么什么都不做
  if (typeof value !== 'object' || value !== null || seen.has(value)) return
  // 将数据添加到seen中，待变遍历地读取过了，避免循环引用引起的死循环
  seen.add(value)
  // 假设value是一个对象，使用for-in读取对象的每一个值，并递归调用traverse进行处理
  for (const key in value) {
    traverse(value[k], seen)
  }
}

function watch (source, cb) {
  // 定义getter
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  effect(
    () => getter(),
    {
      scheduler() {
        cb()
      }
    }
  )
}

/*
* 如果是函数类型，说明用户直接传递了getter函数，这时直接使用用户的getter函数；如果不是函数类型，
*   那么调用traverse递归地读取。
* */
