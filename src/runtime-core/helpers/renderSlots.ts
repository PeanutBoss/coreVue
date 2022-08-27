import { createVNode, Fragment } from '../vNode'

export function renderSlots (slots, name, props) {
    // 根据插槽名从slots对象中取出对应插槽
    const slot = slots[name]
    if (slot) {
        if (typeof slot === "function") {
            // 这里的 slot 是在initSlots中初始化后的函数 slots[key] = props => normalizeSlotValue(value(props))
            return createVNode(Fragment, {}, slot(props))
        }
    }
}
