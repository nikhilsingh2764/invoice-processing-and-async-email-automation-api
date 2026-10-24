// Observer: a BroadcastChannel carries login and logout between tabs.
const NAME = 'invoicepilot-auth'

function open() {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(NAME)
  } catch {
    return null
  }
}

export function postAuthEvent(type) {
  const ch = open()
  if (!ch) return
  ch.postMessage({ type })
  ch.close()
}

export function onAuthEvent(handler) {
  const ch = open()
  if (!ch) return () => {}
  ch.onmessage = (event) => {
    const type = event?.data?.type
    if (type === 'login' || type === 'logout') handler(type)
  }
  return () => ch.close()
}
