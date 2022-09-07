export function shouldUpdateComponent (prevVNode, nextVNode) {
    const { props: nextProps } = nextVNode
    const { props: prevProps } = prevVNode
    // 如果props长度不相等，直接返回true
    if (Object.keys(nextProps).length !== Object.keys(prevProps).length) {
        return true
    }
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true
        }
    }
    // 执行到这里说明props没有变化
    return false
}
