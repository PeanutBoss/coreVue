export const extend = Object.assign

export function isObject (val) {
  return val !== null && typeof val === 'object'
}

export const hasChange = (oldValue, newValue) => {
  return !Object.is(oldValue, newValue)
}
