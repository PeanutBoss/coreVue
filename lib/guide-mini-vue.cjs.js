'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vNode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // slot - 组件&object
    if (vNode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vNode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vNode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    // 根据插槽名从slots对象中取出对应插槽
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            // 这里的 slot 是在initSlots中初始化后的函数 slots[key] = props => normalizeSlotValue(value(props))
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const EMPTY_OBJECT = {};
function isObject(val) {
    return val !== null && typeof val === 'object';
}
const hasChange = (oldValue, newValue) => {
    return !Object.is(oldValue, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandleKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

const publicPropertiesMap = {
    $el: i => i.vNode.el,
    $slots: i => i.slots,
    $props: i => i.props
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

// 将没有处理过的props给到instance
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

function initSlots(instance, children) {
    const { vNode } = instance;
    if (vNode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlot(children, instance.slots);
    }
}
function normalizeObjectSlot(children, slots) {
    for (const key in children) {
        const value = children[key];
        // 将 slots 设置为对象，从里面根据插槽名取出对应插槽
        // normalizeSlotValue 接受的是结果，但此时value是函数，且需要传入props
        slots[key] = props => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let activeEffect; // 全局变量保存effect
let shouldTrack; // 是否应该收集依赖
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true; // true的时候，说明依赖没有清除
        this.deps = [];
        this._fn = fn;
    }
    run() {
        /*
        * stop状态：不收集依赖
        * */
        // 是否收集依赖用shouldTrack做区分
        if (!this.active) {
            return this._fn(); // stop状态直接执行fn就可以了
        }
        /*
        * !stop状态：需要收集依赖
        * */
        shouldTrack = true; // 不是stop状态应该将开关打开（不是stop状态，就让它可以收集依赖）
        activeEffect = this; // 当前的effect实例
        const result = this._fn(); // 执行fn，会触发响应式对象的get操作，在get操作中去收集依赖
        // 需要reset的操作
        shouldTrack = false; // 重置为false，默认是不能收集依赖的
        return result;
    }
    stop() {
        if (this.active) {
            cleanUpEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 删除依赖
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    /*
    * 一个effect关联的所有依赖都在它的deps属性中
    * 所以清空一个effect的依赖就相当于让它的deps属性的长度为0
    * */
    effect.deps.length = 0;
}
const targetMap = new Map(); // 一个对象的所有依赖保存在这里面
/* 收集依赖 */
function track(target, key) {
    /*
    * 优化点1：如果不需要收集依赖，下面的代码不需要执行了
    * */
    // if (!activeEffect) return
    // if (!shouldTrack) return
    if (!isTracking())
        return;
    // 收集依赖，这些依赖是唯一的（set数据结构）
    // target ---对应---> key ---对应---> dep
    let depsMap = targetMap.get(target); // 一个对象的key对应的所有依赖保存在这里面
    // 初始化
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
/*
* 抽离保存依赖的操作，方便ref复用
* 因为ref只有一个value值，所以不需要通过Map来收集多个属性的依赖
*   只需要一个set来保存value属性的依赖就行
* */
function trackEffects(dep) {
    // 如果已经收集了，直接return掉
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    // _effect.onStop = options.onStop
    // Object.assign(_effect, options)
    extend(_effect, options);
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
/* 触发依赖 */
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 抽离get
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // console.log(key)
        // 如果访问的key是 is_reactive，就说明调用了isReactive
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            // 如果isReadonly是false，就说明它是一个reactive
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        /*
        * 检查是不是shallowReadonly，如果是（shallowReadonly包含两个条件：1.不需要嵌套 2.是readonly，不需要收集依赖），
        *   则不需要进行包装，直接返回res就可以
        * */
        if (shallow) {
            return res;
        }
        /*
        * 检查res是不是 普通对象，如果是普通对象，使用reactive包装它并返回
        * readonly的嵌套也也是在这里实现，根据 isReadonly判断
        *   如果是 isReadonly === true 用readonly包装并返回，否则用reactive包装并返回
        *
        * 这块我自己有一个问题，就是在这里返回 res 下面收集依赖操作难道就不需要了吗？
        * 思考了下，答案是需要的，不过收集依赖并不是在这一层做的，因为它 res 是一个普通对象，
        *   所以在这里收集依赖是没有意义的，而且也收集不了，通过reactive包装之后，会在包装的这一层
        *   去收集依赖。
        * */
        if (isObject(res)) {
            // return reactive(res)
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 检查是否是reactive，如果是reactive，则需要收集依赖
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
// 抽离set
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get,
    set
};
const readonlyHandles = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key: ${key} set 失败，因为target是readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandles, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandles);
}
// 只读，意味着不能set
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandles);
}
function createReactiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`raw ${raw}必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    console.log('emit', event);
    const { props } = instance;
    // Tpp - 先写特定的行为 -> 重构成通用的行为
    // add -> Add
    // add-foo -> AddFoo
    const handlerName = toHandleKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

/*
* 创建一个ref的类
* */
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        // 如果这个value是一个对象，那么需要通过reactive给它进行包装
        // 1.检查value是不是对象
        this._value = convert(value);
        this._rawValue = value;
        // this._value = value
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        /*
        * newValue -> this._value，如果相等不需要执行操作
        * todo 抽离成hasChange
        * */
        // if (Object.is(newValue, this._value)) return
        /*
        * 对比的时候呢，是需要对两个原始值进行对比，而如果value是一个对象的话，this._value就成了reactive
        *   所以传入的value如果是对象，在对比前需要将reactive转为原始对象
        * 解决办法：初始化RefImpl的时候，声明一个值（_rawValue）保存传入的value，对比的时候就使用_rawValue对比
        * */
        if (hasChange(newValue, this._rawValue)) {
            // 一定需要先去修改value，再去触发依赖
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
// 判断传入的值是不是ref
function isRef(ref) {
    // 如果传入的是一个原始数据类型，那么将返回undefined，所以通过取反两次将其转为布尔值
    return !!ref.__v_isRef;
}
// 传入一个ref数据，返回它的原始值
function unRef(ref) {
    // 如果是ref，返回它的value属性，否则直接返回就可以
    return isRef(ref) ? ref.value : ref;
}
// 代理ref，比如在vue模板（template）中使用ref时，不需要.value
function proxyRef(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        /*
        * set的时候判断它是不是ref类型，如果是ref类型，那么需要修改它的value属性
        * */
        set(target, key, value) {
            /*
            * 当前的值是ref 且 将要更新的值不是ref的时候，需要给当前值（target[value]）的value属性赋值
            * 否则直接给这个当前值取赋值就可以（这个重点在于当前值（target[key]）是不是ref，如果不是那么做简单的赋值操作就可以）
            *   1.在当前值不是一个ref，将要更新的值是ref，也是直接赋值：target[key] = value
            *   2.两个都不是ref的情况下，简单赋值就可以：target[key] = value
            * 在当前值（target[key]）是一个ref，将要更新的值也是ref的情况下（两个值都是引用类型），
            *     需要修改的就是target[key]的指针，要做的操作也是：target[key] = value
            * */
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function createComponentInstance(vNode, parent) {
    const component = {
        vNode,
        type: vNode.type,
        setupState: {},
        props: {},
        slots: {},
        parent,
        providers: parent ? parent.providers : {},
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vNode.props);
    initSlots(instance, instance.vNode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 第一次patch的时候instance.type就是传入的App组件
    const Component = instance.type;
    // 创建一个代理对象用来拦截render函数中的this
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // currentInstance = instance
        setCurrentInstance(instance);
        // 因为传入的props是浅只读的，所以使用 shallowReadonly 包裹
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        // currentInstance = null
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO
    if (typeof setupResult === 'object') {
        // 为ref类型的数据做代理，可以直接访问，不需要.value
        instance.setupState = proxyRef(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

/*
* 实际上是数据的存取
* 存在当前的组件实例上
*
* provider/inject只能在setup下使用,因为只有才setup中才能获取到currentInstance
* */
function provider(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { providers } = currentInstance;
        const parentProviders = currentInstance.parent.providers;
        // 初始化的时候才会执行
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders);
        }
        providers[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import {render} from "./renderer";
function createAppAPI(render) {
    return function createApp(rootComponent) {
        // debugger
        return {
            // 接收一个element实例作为根容器，整体入口
            mount(rootContainer) {
                // 先转vNode  component -> vNode
                // 所有逻辑操作都会基于vNode做处理
                const vNode = createVNode(rootComponent);
                render(vNode, rootContainer);
            }
        };
    };
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vNode, container) {
        patch(null, vNode, container, null, null);
    }
    /*
    * oldVNode - 不存在说明初始化，存在说明更新
    * */
    function patch(oldVNode, vNode, container, parentComponent, anchor) {
        // ShapeFlags - &
        const { shapeFlag, type } = vNode;
        switch (type) {
            case Fragment:
                processFragment(oldVNode, vNode, container, parentComponent, anchor);
                break;
            case Text:
                processText(oldVNode, vNode, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(oldVNode, vNode, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 去处理组件
                    processComponent(oldVNode, vNode, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(oldVNode, vNode, container, parentComponent, anchor) {
        mountComponent(vNode, container, parentComponent, anchor);
    }
    function mountComponent(vNode, container, parentComponent, anchor) {
        // 与mountElement同理，创建并返回一个组件对象
        const instance = createComponentInstance(vNode, parentComponent);
        // 处理setup中的信息（例如：实现代理this）
        setupComponent(instance);
        setupRenderEffect(instance, vNode, container, anchor);
    }
    function processElement(oldVNode, vNode, container, parentComponent, anchor) {
        if (!oldVNode) {
            mountElement(vNode, container, parentComponent, anchor);
        }
        else {
            patchElement(oldVNode, vNode, container, parentComponent, anchor);
        }
    }
    function mountElement(vNode, container, parentComponent, anchor) {
        // $el：这里的虚拟节点是element类型的，也就是App中的根元素div；return instance.vNode.el中的虚拟节点是组件实例对象的虚拟节点
        // 创建对应的DOM，同时绑定到虚拟DOM上
        const el = vNode.el = hostCreateElement(vNode.type);
        const { children, shapeFlag } = vNode;
        // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 如果是数组类型（说明有多个子元素），调用patch递归处理子节点
            mountChildren(vNode.children, el, parentComponent, anchor);
        }
        // 处理vNode对应的属性
        for (const key in vNode.props) {
            const val = vNode.props[key];
            hostPatchProp(el, key, null, val);
        }
        // 将DOM添加到对应容器中
        hostInsert(el, container, anchor);
    }
    function patchElement(oldVNode, vNode, container, parentComponent, anchor) {
        console.log('patchElement');
        console.log('oldVNode', oldVNode);
        console.log('vNode', vNode);
        /*
        * props
        * children
        * */
        const oldProps = oldVNode.props || EMPTY_OBJECT;
        const newProps = vNode.props || EMPTY_OBJECT;
        const el = (vNode.el = oldVNode.el);
        patchChildren(oldVNode, vNode, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(oldVNode, newVNode, container, parentComponent, anchor) {
        const prevShapeFlag = oldVNode.shapeFlag;
        const oldChildren = oldVNode.children;
        const shapeFlag = newVNode.shapeFlag;
        const newChildren = newVNode.children;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 1.把老的清空
                unmountChildren(oldVNode.children);
            }
            if (newChildren !== oldChildren) {
                // 2.设置新的text
                hostSetElementText(container, newChildren);
            }
        }
        else {
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(newChildren, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyedChildren(oldChildren, newChildren, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0, l2 = c2.length, e1 = c1.length - 1, e2 = l2 - 1;
        function isSomeVNodeType(oldVNode, newVNode) {
            return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key;
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            const oldVNode = c1[i];
            const newVNode = c2[i];
            if (isSomeVNodeType(oldVNode, newVNode)) {
                patch(oldVNode, newVNode, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const oldVNode = c1[e1];
            const newVNode = c2[e2];
            if (isSomeVNodeType(oldVNode, newVNode)) {
                patch(oldVNode, newVNode, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            /* 新的比老的长 - 创建 */
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            /* 老的比新的长 - 删除 */
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            /* 对比中间部分 */
            let s1 = i;
            let s2 = i;
            // 新节点总数量
            const toBePatched = e2 - s2 + 1;
            // 处理过的数量
            let patched = 0;
            // 创建新节点的映射表
            const keyToNewIndexMap = new Map();
            let moved = false;
            let maxNewIndexSoFar = 0;
            let newIndexToOldInIndexMap = new Array(toBePatched);
            // 初始化映射表  -  应该是填充 -1 - 标识没有建立映射关系
            for (let j = 0; j < toBePatched; j++)
                newIndexToOldInIndexMap[j] = 0;
            for (let j = s2; j <= e2; j++) {
                const nextChild = c2[j];
                keyToNewIndexMap.set(nextChild.key, j);
            }
            for (let j = s1; j <= e1; j++) {
                const prevChild = c1[j];
                // 如果新节点已经被遍历完
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    // 查找旧节点在新节点列表中的下标
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let k = s2; k <= e2; k++) {
                        if (isSomeVNodeType(prevChild, c2[k])) {
                            newIndex = k;
                            break;
                        }
                    }
                }
                if (newIndex == undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    /* TODO - 注意映射值 */
                    newIndexToOldInIndexMap[newIndex - s2] = j + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    // patch一个就意味着处理完一个
                    patched++;
                }
            }
            // 获取最长递增子序列
            const increasingNewIndexSequence = getSequence();
            let k = increasingNewIndexSequence.length - 1;
            for (let j = toBePatched - 1; j >= 0; j--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldInIndexMap[j] === 0) {
                    // 新创建节点
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (k < 0 || j !== increasingNewIndexSequence[k]) {
                        console.log('需要移动');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        // 不需要移动
                        k++;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            // 不存在老的props，不需要进行下面的操作
            // if (!Object.keys(oldProps).length) return
            if (oldProps !== EMPTY_OBJECT) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    // 当children为数组时，处理子节点
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(child => {
            patch(null, child, container, parentComponent, anchor);
        });
    }
    function processFragment(oldVNode, vNode, container, parentComponent, anchor) {
        mountChildren(vNode.children, container, parentComponent, anchor);
    }
    function processText(oldVNode, vNode, container) {
        console.log(vNode, container);
        const { children } = vNode;
        const textNode = vNode.el = document.createTextNode(children);
        container.append(textNode);
    }
    // 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象
    function setupRenderEffect(instance, vNode, container, anchor) {
        /*
        * 调用的组件实例的render方法结合组件的数据将视图渲染出来
        *   因此更新的时候需要重新调用render函数渲染视图
        *   将渲染操作使用effect包裹
        * */
        effect(() => {
            if (!instance.isMounted) { // 初始化
                console.log('init');
                // instance.render 来自于 finishComponentSetup 方法，就是组件的render方法
                // 绑定this，让render中的this指向创建的代理对象
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                // vNode -> patch
                // vNode -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
                // subTree指的就是class="root"的根节点
                // 子元素处理完成之后
                vNode.el = subTree.el;
                instance.isMounted = true;
            }
            else { // 更新
                console.log('update');
                const subTree = instance.render.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree; // 更新subTree
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function getSequence(array) {
    return [1, 3];
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    console.log('patchProp');
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, container, anchor) {
    container.insertBefore(child, anchor || null);
    // container.append(el)
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provider = provider;
exports.proxyRef = proxyRef;
exports.ref = ref;
exports.renderSlots = renderSlots;
