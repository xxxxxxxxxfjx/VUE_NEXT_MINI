import { EMPTY_OBJ, ShapeFlags } from '@vue/shared'
import {
  Comment,
  Fragment,
  RendererNode,
  Text,
  VNode,
  isSameVNodeType
} from './vnode'

export interface RendererOptions {
  insert(el: Element, parent: Element, anchor?: Element | null): void
  createElement(type: string): Element
  setElementText(node: Element, text: string): void
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  remove(el: Element): void
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions) {
  const {
    insert: hostInsert,
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
    remove: hostRemove
  } = options

  // element的挂载操作
  const mountElement = (
    vnode: VNode,
    container: Element,
    anchor: Element | null
  ) => {
    /**
     * 1.创建元素
     * 2.设置文本
     * 3.设置属性
     * 4.插入元素
     */
    const { type, props, shapeFlag } = vnode
    // 1.创建元素
    let el = (vnode.el = hostCreateElement(type as string))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2.设置文本
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    }
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    hostInsert(el, container, anchor)
  }

  const patchElement = (oldVNode: VNode, newVNode: VNode) => {
    const el = (newVNode.el = oldVNode.el) as RendererNode
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ
    patchChildren(oldVNode, newVNode, el, null)
    patchProps(el, newVNode, oldProps, newProps)
  }

  const patchChildren = (
    oldVNode: VNode,
    newVNode: VNode,
    contaienr,
    anchor: Element | null
  ) => {
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    const c2 = newVNode.children
    const { shapeFlag } = newVNode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (c2 !== c1) {
        hostSetElementText(contaienr, c2)
      }
    }
  }

  const patchProps = (el, vnode: VNode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev && next !== 'value') {
          hostPatchProp(el, key, prev, next)
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  const processElement = (
    oldVNode: VNode | null,
    newVNode: VNode,
    container: Element,
    anchor: Element | null
  ) => {
    if (oldVNode == null) {
      // 挂载
      mountElement(newVNode, container, anchor)
    } else {
      // 更新
      patchElement(oldVNode, newVNode)
    }
  }

  const patch = (
    oldVNode: VNode | null,
    newVNode: VNode,
    container,
    anchor = null
  ) => {
    if (oldVNode === newVNode) {
      return
    }
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
        }
    }
  }

  const unmount = (oldVNode: VNode) => {
    hostRemove(oldVNode.el!)
  }
  const render = (vnode: VNode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render
  }
}
