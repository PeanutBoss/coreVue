/* 处理class */

/*
 * 对 class 的处理
 * vue中声明class可以有多种方式：
 *   - 1.指定class字符串 class="active"
 *   - 2.指定class为对象值 :class="{ active: true }"
 *   - 3.class是包含两种方式的数组 :class=['active', { light: true }]
 * 因为class的值可以是多种类型，所以必须在设置元素的class之前将值统一为字符串形式，再把该字符串
 *   作为元素的class值去设置。
 * */

function normalizeClass(classData) {
    // 数据转换的小算法，省略
}
const vNode = {
    type: 'p',
    props: {
        class: normalizeClass([
            'foo bar',
            { baz: true }
        ])
    }
}

/*
 * 上面可以使class值进行正常化，最后将正常化后的值设置到元素上。
 * */
// 设置class有三种方式 setAttribute/className/classList （className性能最优所以优先使用）
const parameters = {
    patchProps(el, key, preValue, nextValue) {
        if (key === 'class') {
            el.className = nextValue || ''
        } else if (shouldSetAsProps(el.key, nextValue)) {
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    }
}
const renderer = createRenderer(parameters)
