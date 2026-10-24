import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Security headers live in vercel.json. `vite preview` serves the same map so
// the production policy can be exercised locally.
function readHeaderMap() {
  try {
    const cfg = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
    const block = (cfg.headers || []).find((h) => h.source === '/(.*)')
    const map = {}
    for (const { key, value } of block?.headers || []) map[key] = value
    return map
  } catch {
    return {}
  }
}

// Preload the main latin woff2 files so text does not flash.
function fontPreload() {
  return {
    name: 'invoicepilot-font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        const links = Object.keys(ctx.bundle)
          .filter((name) => /(figtree|bricolage-grotesque)-latin-wght-normal.*\.woff2$/.test(name))
          .map((name) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${name}">`)
          .join('\n    ')
        return html.replace('</head>', `    ${links}\n  </head>`)
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8000'
  const proxy = { '/api': { target, changeOrigin: true, secure: false } }
  const headers = readHeaderMap()

  return {
    plugins: [react(), tailwindcss(), fontPreload()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy, headers },
    esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
    build: {
      target: ['chrome100', 'edge100', 'firefox100', 'safari16'],
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) return 'charts'
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router') || id.includes('node_modules/scheduler')) return 'framework'
            if (id.includes('node_modules/@tanstack') || id.includes('node_modules/axios') || id.includes('node_modules/zod') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) return 'data'
            return undefined
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.js'],
      include: ['tests/**/*.test.{js,jsx}'],
      css: false,
    },
  }
})
