import { createVNode } from "../vNode";

export function renderSlots (slots, name) {
    const slot = slots[name] || slots
    if (slot) {
        return createVNode('div', {}, slot)
    }
}
