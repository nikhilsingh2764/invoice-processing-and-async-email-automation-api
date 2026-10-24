import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia or BroadcastChannel; the app feature-detects both, but tests need predictable stubs.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })
}
