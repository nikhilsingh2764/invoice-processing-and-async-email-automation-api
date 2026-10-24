// Starts the mock API and the Vite dev server together: `npm run dev:mock`.
import { spawn } from 'node:child_process'
import { startMock } from './mock-api.mjs'

const port = 4000
await startMock(port)
console.log(`Mock API ready on http://localhost:${port}. Demo login: demo@example.com / Demo@1234 (OTP 123456)`)
const vite = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite'], { stdio: 'inherit', env: { ...process.env, VITE_MOCK: 'true', VITE_PROXY_TARGET: `http://localhost:${port}` } })
vite.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => vite.kill('SIGINT'))
