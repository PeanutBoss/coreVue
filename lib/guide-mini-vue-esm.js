const Fragment = Symbol('Fragment');
function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
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

const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === 'object';
}
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
    $slots: i => i.slots
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

const targetMap = new Map(); // 一个对象的所有依赖保存在这里面
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

function createComponentInstance(vNode) {
    const component = {
        vNode,
        type: vNode.type,
        setupState: {},
        props: {},
        slots: {},
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
        // 因为传入的props是浅只读的，所以使用 shallowReadonly 包裹
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vNode, container) {
    patch(vNode, container);
}
function patch(vNode, container) {
    // ShapeFlags - &
    const { shapeFlag, type } = vNode;
    switch (type) {
        case Fragment:
            processFragment(vNode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vNode, container);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                // 去处理组件
                processComponent(vNode, container);
            }
            break;
    }
}
function processComponent(vNode, container) {
    mountComponent(vNode, container);
}
function mountComponent(vNode, container) {
    // 与mountElement同理，创建并返回一个组件对象
    const instance = createComponentInstance(vNode);
    // 处理setup中的信息（例如：实现代理this）
    setupComponent(instance);
    setupRenderEffect(instance, vNode, container);
}
function processElement(vNode, container) {
    mountElement(vNode, container);
}
function mountElement(vNode, container) {
    // $el：这里的虚拟节点是element类型的，也就是App中的根元素div；return instance.vNode.el中的虚拟节点是组件实例对象的虚拟节点
    // 创建对应的DOM，同时绑定到虚拟DOM上
    const el = vNode.el = document.createElement(vNode.type);
    const { children, shapeFlag } = vNode;
    // 处理子节点 - 如果是string类型直接赋值给DOM元素的textContent属性
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        // 如果是数组类型（说明有多个子元素），调用patch递归处理子节点
        mountChildren(vNode, el);
    }
    // 处理vNode对应的属性
    for (const key in vNode.props) {
        const val = vNode.props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 将DOM添加到对应容器中
    container.appendChild(el);
}
// 当children为数组时，处理子节点
function mountChildren(vNode, container) {
    vNode.children.forEach(child => {
        patch(child, container);
    });
}
function processFragment(vNode, container) {
    mountChildren(vNode, container);
}
// 第一次渲染App组件的时候会执行，并且将render函数的this绑定为创建的代理对象
function setupRenderEffect(instance, vNode, container) {
    // instance.render 来自于 finishComponentSetup 方法，就是组件的render方法
    // 绑定this，让render中的this指向创建的代理对象
    const subTree = instance.render.call(instance.proxy);
    // vNode -> patch
    // vNode -> element -> mountElement
    patch(subTree, container);
    // subTree指的就是class="root"的根节点
    // 子元素处理完成之后
    vNode.el = subTree.el;
}

function createApp(rootComponent) {
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

export { createApp, h, renderSlots };
