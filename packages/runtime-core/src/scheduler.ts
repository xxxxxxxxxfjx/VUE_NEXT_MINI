let isFlushPending = false
const pendingPreFlushCbs: Function[] = []
const resolvePromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null
let activePostFlushCbs: Function[] | null = null

export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: Function, pendingPreFlushCbs: Function[]) {
  pendingPreFlushCbs.push(cb)
  queueFlush()
}

function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvePromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}
function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    activePostFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    for (let index = 0; index < activePostFlushCbs.length; index++) {
      activePostFlushCbs[index]()
    }
  }
}
