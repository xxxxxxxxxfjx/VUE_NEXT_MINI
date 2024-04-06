export function patchDOMProp(el: Element, key: string, nextValue: unknown) {
  try {
    el[key] = nextValue
  } catch (error) {}
}
