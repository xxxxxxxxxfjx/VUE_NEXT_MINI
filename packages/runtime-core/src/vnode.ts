import {
  ShapeFlags,
  isArray,
  isFunction,
  isObject,
  isString
} from '@vue/shared'
export interface RendererNode {
  [key: string]: any
}
export interface VNode {
  __v_isVNode: true
  type: any
  children: any
  shapeFlag: number
  props: any
  el: any
  key: any
}

export const isVNode = (value: any): value is VNode => {
  return value ? value.__v_isVNode === true : false
}

export const Text = Symbol('Text')
export const Comment = Symbol('Comment')
export const Fragment = Symbol('Fragment')

export function createVNode(type, props, children): VNode {
  if (props) {
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

export function createBaseVNode(type, props, children, shapeFlag): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    children,
    props,
    shapeFlag
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.children = children
  vnode.shapeFlag |= type
}

export function normalizeClass(value: any): string {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      const normalized = normalizeClass(value[index])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const key in value) {
      if (value[key]) {
        res += key + ' '
      }
    }
  }
  return res.trim()
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}

export function cloneIfMounted(child) {
  return child
}

// 将子元素标准化成vnode的形式
export function normalizeVNode(child) {
  if (typeof child === 'object') {
    // 对象类型默认就是标准化的，直接返回
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}
