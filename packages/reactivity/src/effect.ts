import { extend, isArray } from '@vue/shared'
import { Dep, createDep } from './dep'
import { ComputedRefImpl } from './computed'

export let activeEffect: ReactiveEffect | undefined
export type EffectScheduler = (...args: any[]) => any
export interface ReactiveEffectOption {
  lazy?: boolean
  scheduler: EffectScheduler
}

type KeyToDepsMap = Map<any, Dep>
const targetMap = new WeakMap<object, KeyToDepsMap>()
export function track(target: object, key: unknown) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

export function trigger(target: object, key?: unknown, value?: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const deps: Dep | undefined = depsMap.get(key)
  if (!deps) return
  triggerEffects(deps)
}

export function triggerEffects(deps: Dep) {
  const effects = isArray(deps) ? deps : [...deps]
  for (const effct of effects) {
    if (effct.computed) {
      triggerEffect(effct)
    }
  }
  for (const effct of effects) {
    if (!effct.computed) {
      triggerEffect(effct)
    }
  }
}
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}

export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}
  run() {
    activeEffect = this
    return this.fn()
  }

  stop() {}
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOption) {
  const _effect = new ReactiveEffect(fn)
  if (options) {
    extend(_effect, options)
  }
  if (!options || !options.lazy) {
    _effect.run()
  }
}
