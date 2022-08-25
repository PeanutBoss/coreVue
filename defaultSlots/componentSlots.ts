export function initSlots (instance, children) {
    instance.slots = Array.isArray(children) ? children : [children]
    // normalizeObjectSlot(children, instance.slots)
}

function normalizeObjectSlot(children, slots) {
    // instance.slots = Array.isArray(children) ? children : [children]

    // const slots = {}
    for (const key in children) {
        const value = children[key]
        slots[key] = normalizeSlotValue(value)
    }
    // instance.slots = slots
}

function normalizeSlotValue (value) {
    return Array.isArray(value) ? value : [value]
}
