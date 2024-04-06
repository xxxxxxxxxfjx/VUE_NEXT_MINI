import { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect>
export function createDep(effects?: Dep): Dep {
  const dep = new Set(effects) as Dep
  return dep
}
