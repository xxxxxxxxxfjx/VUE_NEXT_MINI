import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'

export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
  } else if (isOn(key)) {
  } else {
  }
}