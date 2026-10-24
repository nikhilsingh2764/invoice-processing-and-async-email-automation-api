/* Runs synchronously in <head> before first paint (external file so the CSP needs no inline script). */
(function () {
  var root = document.documentElement
  var choice = 'system'
  try {
    var stored = window.localStorage.getItem('ip.theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') choice = stored
  } catch (e) { /* storage blocked: fall back to system */ }
  var dark = choice === 'dark' || (choice === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
  root.style.colorScheme = dark ? 'dark' : 'light'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#0F0E0D' : '#FBF7F2')
  try {
    var d = window.localStorage.getItem('ip.density')
    if (d === 'compact' || d === 'comfortable') root.setAttribute('data-density', d)
  } catch (e) { /* ignore */ }
  var supported = !!(window.CSS && CSS.supports && CSS.supports('container-type: inline-size'))
  if (!supported) root.setAttribute('data-legacy', 'true')
})()
