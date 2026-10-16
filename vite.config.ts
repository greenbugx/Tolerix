import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'

const nodeRequire = createRequire(import.meta.url)
const litertWasmRoot = path.join(path.dirname(nodeRequire.resolve('@litert-lm/core/package.json')), 'wasm')

const litertFiles = [
  'litertlm_wasm_internal.js',
  'litertlm_wasm_internal.wasm',
  'litertlm_wasm_asyncify_internal.js',
  'litertlm_wasm_asyncify_internal.wasm',
  'litertlm_wasm_compat_internal.js',
  'litertlm_wasm_compat_internal.wasm',
  'litertlm_wasm_compat_asyncify_internal.js',
  'litertlm_wasm_compat_asyncify_internal.wasm'
]

function runtimeAssets(): Plugin {
  return {
    name: 'tolerix-runtime-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = request.url?.split('?')[0]
        if (url?.startsWith('/runtime/litert/')) {
          const file = url.replace('/runtime/litert/', '')
          const absolute = path.join(litertWasmRoot, file)
          if (existsSync(absolute)) {
            response.setHeader(
              'Content-Type',
              file.endsWith('.wasm') ? 'application/wasm' : 'text/javascript'
            )
            response.setHeader('Content-Length', String(statSync(absolute).size))
            response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
            createReadStream(absolute).pipe(response)
            return
          }
        }
        next()
      })
    },
    writeBundle(options) {
      const outDir = options.dir ?? path.dirname(options.file ?? '')
      const target = path.join(outDir, 'runtime', 'litert')
      mkdirSync(target, { recursive: true })
      for (const file of litertFiles) {
        const source = path.join(litertWasmRoot, file)
        if (existsSync(source)) {
          copyFileSync(source, path.join(target, file))
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), runtimeAssets()],
  worker: {
    format: 'es'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
})
