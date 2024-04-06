import { EMPTY_OBJ, hasChanged, isObject } from '@vue/shared'
import { isReactive } from 'packages/reactivity/src/reactive'
import { queuePreFlushCb } from './scheduler'
import { ReactiveEffect } from 'packages/reactivity/src/effect'

export interface WatchOptions<T = boolean> {
  immediate?: T
  deep?: T
}

export function watch(source, cb: Function, options: WatchOptions) {
  return toWatch(source as any, cb, options)
}

function toWatch(
  source,
  cb: Function,
  { immediate, deep }: WatchOptions = EMPTY_OBJ
) {
  let getter: () => any

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }

  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  // 旧值
  let oldValue = EMPTY_OBJ

  // job函数
  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  // 调度器的定义
  let scheduler = () => queuePreFlushCb(job)

  // 生成effect实例
  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

function traverse(value: unknown) {
  if (!isObject(value)) {
    return
  }
  for (const key in value as object) {
    traverse((value as object)[key])
  }
  return value
}
