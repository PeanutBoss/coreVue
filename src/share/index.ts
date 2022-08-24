export const extend = Object.assign

export function isObject (val) {
  return val !== null && typeof val === 'object'
}

export const hasChange = (oldValue, newValue) => {
  return !Object.is(oldValue, newValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)


export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
      return c ? c.toUpperCase() : ''
  })
}
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
export const toHandleKey = (str: string) => {
  return str ? 'on' + capitalize(str) : ''
}
