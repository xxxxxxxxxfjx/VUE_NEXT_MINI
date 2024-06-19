import { isString } from '@vue/shared'

export function patchStyle(el: Element, prev, next) {
  // 获取元素样式
  const style = (el as HTMLElement).style
  // 判断next样式类型
  const isCssString = isString(next)
  // next存在，且不是字符串类型
  if (next && !isCssString) {
    // 设置新的样式
    for (const key in next) {
      setStyle(style, key, next[key])
    }
    // 遍历旧样式，删除不存在于新样式中的旧样式
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  }
}

function setStyle(style: CSSStyleDeclaration, name: string, value: string) {
  // 设置样式值
  style[name] = value
}
