/* KeepAlive - 缓存管理 */

/*
* KeepAlive 组件新增了cache接口，允许用户指定缓存实例
* */

const _cache = new Map()
const cache = {
  get (key) {
    return _cache.get(key)
  },
  set (key, value) {
    _cache.set(key, value)
  },
  delete (key) {
    _cache.delete(key)
  },
  forEach (fn) {
    _cache.forEach(fn)
  }
}

/*
* 传入缓存对象，在缓存对象内部管理缓存
* 相当于将缓存的管理劝降从KeepAlive组件转交给用户了
* */
const useTemplate = `
<KeepAlive :cache="cache">
  省略
</KeepAlive>
`
