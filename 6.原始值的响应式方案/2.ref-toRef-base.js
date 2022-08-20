/* 解构导致的响应丢失 */

export default {
  setup () {
    // 创建响应式数据
    const obj = reactive({ foo: 1, bar: 2 })
    // 将数据暴露在模板中
    return {
      ...obj
    }
  }
}

// 接下来就可以在模板中访问暴露出来的foo、bar,但当修改它们的值时，不会重新渲染
// 这是由于 ... 运算符导致的
// return { ...obj }
// 等价于
// return { foo: 1, bar: 2 }
// 实际上就是返回了一个普通对象，不具有任何响应式能力。

/*
* 那么如何解决呢？
* */
const obj = { foo: 1, bar: 2 }
// newObj对象下具有obj对象同名的属性，并且每个属性值都是一个对象，该对象具有一个访问器属性value，
//    当读取value属性是，其实读取的是 obj 对象下响应的属性值
const newObj = {
  foo: {
    get value () {
      return obj.foo
    }
  },
  bar: {
    get value () {
      return obj.bar
    }
  }
}
