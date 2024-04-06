import { RendererOptions } from 'packages/runtime-core/src/renderer'

const doc = document
export const nodeOps: Omit<RendererOptions, 'patchProp'> = {
  insert: (child: Element, parent: Element, anchor) => {
    parent.insertBefore(child, anchor || null)
  },
  createElement: (type: string): Element => {
    const el = doc.createElement(type)
    return el
  },
  setElementText: (el: Element, text: string) => {
    el.textContent = text
  },
  remove: (child: Element) => {
    const parentNode = child.parentNode
    if (parentNode) {
      parentNode.removeChild(child)
    }
  }
}
