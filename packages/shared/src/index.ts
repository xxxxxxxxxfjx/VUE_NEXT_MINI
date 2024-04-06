export * from './shapeFlags'

export const isArray = Array.isArray
export const isObject = (value: unknown) =>
  value !== null && typeof value === 'object'

export const hasChanged = (newValue: any, rawValue: any): boolean =>
  !Object.is(newValue, rawValue)

export const isFunction = (val: unknown): val is Function => {
  return typeof val === 'function'
}

export const isString = (val: unknown): val is string => {
  return typeof val === 'string'
}

export const extend = Object.assign

export let EMPTY_OBJ: { readonly [k: string]: any } = {}

const onReg = /^on[^a-z]/
export const isOn = (value: string): boolean => {
  return onReg.test(value)
}
