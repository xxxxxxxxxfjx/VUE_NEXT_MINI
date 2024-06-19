export function patchEvent(
  el: Element & { _vei?: Object },
  rowName: string,
  prevValue,
  nextValue
) {
  // 获取挂载在el上存储事件的对象
  const invokers = el._vei || (el._vei = {})
  // 获取当前rowName对应的值
  const existingInvoker = invokers[rowName]

  if (nextValue && existingInvoker) {
    // 事件更新
    existingInvoker.value = nextValue
  } else {
    // 获取事件的小写，用在addEventListener函数中
    const name = parseName(rowName)
    if (nextValue) {
      // 新增事件
      const invoker = (invokers[rowName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      // 删除事件
      el.removeEventListener(name, existingInvoker)
      invokers[rowName] = undefined
    }
  }
}

function parseName(name: string) {
  return name.slice(2).toLocaleLowerCase()
}

function createInvoker(initialInvoker) {
  const invoker = () => {
    invoker.value()
  }
  invoker.value = initialInvoker
  return invoker
}
