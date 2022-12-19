export function emit(instance, eventName, ...rest) {
  const { props } = instance
  const propName = `on${eventName.substring(0, 1).toUpperCase()}${eventName.slice(1)}`
  console.log(propName)
  const eventCallback = props[propName]
  eventCallback && eventCallback(...rest)
}
