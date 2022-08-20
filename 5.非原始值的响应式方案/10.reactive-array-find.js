/* 数组查找方法的代理 */

/*
* 如果通过代理对象访问元素值时，如果值仍然时可被代理的，那么得到的值就是新的代理对象而不是原始对象。
* */

const obj = {}
const arr = reactive([obj])
console.log(arr.includes(arr[0])) // false
/*
* arr.includes(arr[0])，其中 arr[0]得到的是一个代理对象，而在includes方法内部也会通过arr
*   访问数组元素，从而也得到一个代理对象，问题时这两个代理对象是不同的。
* */

// 定义一个Map实例，存储原始对象到代理对象的映射
const reactiveMap = new Map()

function reactive (obj) {
  // 优先通过原始对象 obj 查找之前创建的代理对象，如果找到则直接返回
  const existProxy = reactiveMap.get(obj)
  if (existProxy) return existProxy
  // 否则创建新的代理对象
  const proxy = createReactive(obj)
  // 并存储到Map中，从而避免重复创建
  reactiveMap.set(obj, proxy)
}

/*
* 上面的问题解决后，还存在一个问题
* 因为includes内部的this指向的是代理对象arr，并且在获取数组元素时得到的值也是代理对象，所以
*   拿原始对象obj去查找时查找不到的，因此返回false
* */
console.log(arr.includes(obj)) // false

// const arrayInstance = {
//   includes: function () {}
// }

function createReactive (obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log('get：', key)
      if (key === 'raw') return target

      /*
      * 如果操作的目标对象时数组，并且key存在于arrayInstance上，那么返回定义在arrayInstance上的值
      * */
      if (Array.isArray(target) && arrayInstance.hasOwnProperty(key)) {
        return Reflect.get(arrayInstance, key, receiver)
      }

      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      if (isShallow) return res
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    }
  })
}

const originMethod = Array.prototype.includes
const arrayInstance = {
  includes (...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到res中
    let res = originMethod.apply(this, args)
    if (res === false) {
      // res为false说明没找到，通过this.raw拿到原始数组，再去其中查找并更新res值
      res = originMethod.apply(this.raw, args)
    }
    return res
  }
}

/*
* includes/indexOf/lastIndexOf同理
* */
