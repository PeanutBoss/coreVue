export function emit(instance, eventName, ...rest) {
  const { props } = instance
  const propName = `on${eventName.substring(0, 1).toUpperCase()}${eventName.slice(1)}`
  const eventCallback = props[propName]
  eventCallback && eventCallback(...rest)
}
