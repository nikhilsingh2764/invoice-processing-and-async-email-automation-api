// Public build-time configuration. Everything here ships in the bundle, so never add a secret.
const raw = import.meta.env

export const API_BASE_URL = (raw.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '')
export const GOOGLE_CLIENT_ID = (raw.VITE_GOOGLE_CLIENT_ID || '').trim()
export const IS_SAME_ORIGIN = API_BASE_URL.startsWith('/')
export const SEND_CSRF_HEADER = IS_SAME_ORIGIN || raw.VITE_CSRF_HEADER === 'true'
export const IS_DEV = Boolean(raw.DEV)
export const IS_MOCK = raw.VITE_MOCK === 'true'
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'
export const BUILD_DATE = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : 'dev'
