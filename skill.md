### JavaScript进阶

#### 高阶函数
 - reactive -> createGetter
 ```javascript
    function createGetter (isReadonly = false) {
      return function get (target, key) {
        const res = Reflect.get(target, key)
        if (!isReadonly) {
          track(target, key)
        }
        return res
      }
    }
```