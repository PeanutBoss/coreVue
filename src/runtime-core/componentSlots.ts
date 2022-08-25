import { ShapeFlags } from "../share/ShapeFlags";

export function initSlots (instance, children) {
    const { vNode } = instance
    if (vNode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlot(children, instance.slots)
    }
}

function normalizeObjectSlot(children, slots) {
    for (const key in children) {
        const value = children[key]
        // 将 slots 设置为对象，从里面根据插槽名取出对应插槽
        // normalizeSlotValue 接受的是结果，但此时value是函数，且需要传入props
        slots[key] = props => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue (value) {
    return Array.isArray(value) ? value : [value]
}
