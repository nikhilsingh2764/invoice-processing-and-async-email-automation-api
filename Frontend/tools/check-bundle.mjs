// Bundle guard for `npm run check:bundle` (run after `npm run build`).
// Fails if the entry chunk is too large, if recharts leaks into it, or if dev-only code reached production.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/assets')
if (!existsSync(dist)) {
  console.error('dist/assets not found. Run `npm run build` first.')
  process.exit(2)
}
const BUDGET = { entryGzipKb: 120, anyChunkGzipKb: 220 }
const files = readdirSync(dist).filter((f) => f.endsWith('.js'))
const info = files.map((f) => {
  const text = readFileSync(resolve(dist, f), 'utf8')
  return { f, text, gz: gzipSync(text).length / 1024, raw: statSync(resolve(dist, f)).size / 1024 }
})
const problems = []
for (const c of info) console.log(`${c.f.padEnd(40)} ${c.raw.toFixed(1).padStart(8)} kB  ${c.gz.toFixed(1).padStart(7)} kB gzip`)
const entry = info.find((c) => /^index-/.test(c.f)) || info.sort((a, b) => b.gz - a.gz)[0]
if (entry.gz > BUDGET.entryGzipKb) problems.push(`Entry chunk ${entry.f} is ${entry.gz.toFixed(1)} kB gzip (budget ${BUDGET.entryGzipKb}).`)
for (const c of info) if (c.gz > BUDGET.anyChunkGzipKb) problems.push(`${c.f} is ${c.gz.toFixed(1)} kB gzip (budget ${BUDGET.anyChunkGzipKb}).`)
if (/recharts|CartesianGrid|ResponsiveContainer/.test(entry.text)) problems.push('recharts code is in the entry chunk; it must stay in the lazy charts chunk.')
for (const c of info) if (/__styleguide|Style guide/.test(c.text)) problems.push(`Dev style guide leaked into production chunk ${c.f}.`)
for (const c of info) if (/console\.(log|debug)\(/.test(c.text) && !/node_modules/.test(c.f)) problems.push(`console call found in ${c.f}`)
if (problems.length) {
  console.error(`\n${problems.join('\n')}`)
  process.exit(1)
}
console.log('\nBundle checks passed.')
