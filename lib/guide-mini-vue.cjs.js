'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    return vNode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

const publicPropertiesMap = {
    $el: i => i.vNode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        // 如果setupState中存在这个属性就返回它的值
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vNode) {
    const component = {
        vNode,
        type: vNode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 第一次patch的时候instance.type就是传入的App组件
    const Component = instance.type;
    // 创建一个代理对象用来拦截render函数中的this
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
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
    const { shapeFlag } = vNode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vNode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        // 去处理组件
        processComponent(vNode, container);
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

exports.createApp = createApp;
exports.h = h;
