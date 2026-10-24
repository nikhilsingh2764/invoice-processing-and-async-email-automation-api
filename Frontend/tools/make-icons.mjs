// One-off asset generator (not part of the build): `npm i -D sharp && node tools/make-icons.mjs`.
// Produces the PNG icons, favicon.ico source sizes and the social card in /public.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const mark = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#F26A1B"/><g transform="translate(${pad} ${pad}) scale(${1 - (pad * 2) / 32})"><path d="M9.5 6.5h9.5l5.5 5.5v13a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-17.5a1 1 0 0 1 1-1Z" fill="none" stroke="#1B1410" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 16h8M12 20h5" stroke="#1B1410" stroke-width="1.8" stroke-linecap="round"/></g></svg>`
const rounded = (svg) => svg.replace('<rect width="32" height="32"', '<rect width="32" height="32" rx="7"')
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname

await sharp(Buffer.from(rounded(mark()))).resize(192, 192).png().toFile(out('icon-192.png'))
await sharp(Buffer.from(rounded(mark()))).resize(512, 512).png().toFile(out('icon-512.png'))
await sharp(Buffer.from(mark(4))).resize(512, 512).png().toFile(out('icon-maskable-512.png'))
await sharp(Buffer.from(rounded(mark()))).resize(180, 180).png().toFile(out('apple-touch-icon.png'))
const sizes = await Promise.all([16, 32, 48].map((s) => sharp(Buffer.from(rounded(mark()))).resize(s, s).png().toBuffer()))
// Minimal ICO container with embedded PNGs.
const head = Buffer.alloc(6 + sizes.length * 16)
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4)
let offset = head.length
sizes.forEach((buf, i) => {
  const s = [16, 32, 48][i]
  head.writeUInt8(s, 6 + i * 16); head.writeUInt8(s, 7 + i * 16); head.writeUInt16LE(1, 10 + i * 16); head.writeUInt16LE(32, 12 + i * 16)
  head.writeUInt32LE(buf.length, 14 + i * 16); head.writeUInt32LE(offset, 18 + i * 16); offset += buf.length
})
writeFileSync(out('favicon.ico'), Buffer.concat([head, ...sizes]))

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FBF7F2"/><rect x="0" y="0" width="1200" height="12" fill="#F26A1B"/>
<g transform="translate(90 120) scale(5)"><rect width="32" height="32" rx="8" fill="#F26A1B"/><path d="M9.5 6.5h9.5l5.5 5.5v13a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-17.5a1 1 0 0 1 1-1Z" fill="none" stroke="#1B1410" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 16h8M12 20h5" stroke="#1B1410" stroke-width="1.8" stroke-linecap="round"/></g>
<text x="90" y="400" font-family="Helvetica, Arial, sans-serif" font-size="92" font-weight="700" fill="#1B1410">InvoicePilot</text>
<text x="90" y="470" font-family="Helvetica, Arial, sans-serif" font-size="38" fill="#6B5B50">Invoices, PDFs and email delivery in one place.</text>
<rect x="90" y="510" width="120" height="6" fill="#F26A1B"/></svg>`
await sharp(Buffer.from(card)).png().toFile(out('og-image.png'))
console.log('icons written')
